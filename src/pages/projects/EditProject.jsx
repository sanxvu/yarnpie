import { useContext, useState, useEffect } from 'react';
import { db } from "../../firebase/firebase"
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore"
import { YarnContext } from '../../contexts/YarnContext';
import { useNavigate, Link, useLocation } from "react-router-dom"

export default function AddProject() {
    const { yarnStash } = useContext(YarnContext)
    const navigate = useNavigate()
    const location = useLocation()

    const [projectData, setProjectData] = useState({
        name: "",
        status: "",
        yarnUsed: "",
        amountUsed: 0,
        notes: ""
    })

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Update projectData if location.state has formData
    useEffect(() => {
        if (location.state?.formData) {
            setProjectData(location.state.formData);
        }
        if (location.state?.newYarn) {
            setProjectData(prevProjectData => ({
                ...prevProjectData,
                yarnUsed: location.state.newYarn.id
            }));
        }
    }, [location.state]);

    function handleChange(event) {
        const { name, value } = event.target
        setProjectData(prevProjectData => {
            return {
                ...prevProjectData,
                [name]: value
            }
        })
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setLoading(true);

        let imageUrl = "";
        let imagePublicId = "";

        if (!projectData.yarnUsed) {
            alert("Please select a yarn.")
            return
        }

        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
            formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                imageUrl = data.secure_url; // Get image URL
                imagePublicId = data.public_id; //Get public_id 
                console.log(data)
            } catch (error) {
                console.error("Image upload error:", error);
                setLoading(false);
                return;
            }
        }

        // Update project
        const docRef = doc(db, "projects", location.state.projectId)
        await setDoc(
            docRef,
            {
                ...projectData,
                image: imageUrl,
                imagePublicId: imagePublicId,
            }
        )

        // Update yarn's usedInProjects and remainingAmount
        const yarnRef = doc(db, "yarn", projectData.yarnUsed)
        const yarnSnap = await getDoc(yarnRef)

        if (yarnSnap.exists()) {
            const yarnData = yarnSnap.data();
            const totalAvailable = yarnData.skeinAmount * yarnData.amountPerSkein;
            const newRemainingAmount = totalAvailable - projectData.amountUsed;

            await updateDoc(yarnRef, {
                remainingAmount: newRemainingAmount,
                usedInProjects: arrayUnion(location.state.projectId)
            });
        }

        // Return back to Projects page
        navigate("/projects")
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                onChange={handleChange}
                name="name"
                value={projectData.name}
            />

            <fieldset>
                <legend>Status</legend>

                <input
                    type="radio"
                    id="workInProgress"
                    name="status"
                    value="workInProgress"
                    checked={projectData.status === "workInProgress"}
                    onChange={handleChange}
                />
                <label htmlFor="unemployed">Work in Progress</label>
                <br />

                <input
                    type="radio"
                    id="completed"
                    name="status"
                    value="completed"
                    checked={projectData.status === "completed"}
                    onChange={handleChange}
                />
                <label htmlFor="part-time">Completed</label>
                <br />

                <input
                    type="radio"
                    id="abandoned"
                    name="status"
                    value="abandoned"
                    checked={projectData.status === "abandoned"}
                    onChange={handleChange}
                />
                <label htmlFor="full-time">Abandoned</label>
                <br />

                <input
                    type="radio"
                    id="frogged"
                    name="status"
                    value="frogged"
                    checked={projectData.status === "frogged"}
                    onChange={handleChange}
                />
                <label htmlFor="full-time">Frogged</label>
                <br />
            </fieldset>
            <br />

            <label htmlFor="favColor">Select yarn: </label>
            <br />
            <select
                id="yarnUsed"
                value={projectData.yarnUsed}
                onChange={handleChange}
                name="yarnUsed"
            >
                <option value="">-- Choose from stash--</option>
                {yarnStash.map(yarn => (
                    <option key={yarn.id} value={
                        yarn.id
                    }>{yarn.name}</option>
                ))}
            </select>
            <Link
                to="../addYarn"
                state={{ from: location.pathname, formData: projectData }}
            >
                or add new yarn
            </Link>

            <br />
            <br />

            <input
                type="number"
                placeholder="Amount used oz"
                onChange={handleChange}
                name="amountUsed"
                value={projectData.amountUsed}
            />

            <br />
            <br />

            <textarea
                placeholder="Notes"
                onChange={handleChange}
                name="notes"
                value={projectData.notes}
            />

            <br />

            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}

            <br />
            <br />

            <button type="submit">
                Submit edits
            </button>

        </form>
    )
}