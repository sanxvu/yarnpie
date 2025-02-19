import { useContext, useState } from 'react';
import { db, projectsCollection } from "../../api"
import { doc, getDoc, updateDoc, addDoc, arrayUnion } from "firebase/firestore"
import { YarnContext } from '../stash/YarnContext'
import { useNavigate, Link, useLocation } from "react-router-dom"


export default function AddProject() {
    const [projectData, setProjectData] = useState(
        {
            name: "",
            status: "",
            yarnUsed: "",
            amountUsed: 0,
            notes: ""
        }
    )

    const { yarnStash } = useContext(YarnContext)
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

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
            setPreview(URL.createObjectURL(file)); // Show preview before upload
        }
    }

    async function handleSubmit(event) {
        event.preventDefault() //prevent refresh and resetting inputs 

        setLoading(true);

        let imageUrl = "";

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
                imageUrl = data.secure_url; // Get uploaded image URL
            } catch (error) {
                console.error("Image upload error:", error);
                setLoading(false);
                return;
            }
        }

        const newProject = {
            ...projectData,
            image: imageUrl || "",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        const projectRef = await addDoc(projectsCollection, newProject)
        const projectId = projectRef.id

        // Update yarn's usedInProjects and remainingAmount
        const yarnRef = doc(db, "yarn", projectData.yarnUsed)
        const yarnSnap = await getDoc(yarnRef)

        if (yarnSnap.exists()) {
            const yarnData = yarnSnap.data();
            const totalAvailable = yarnData.skeinAmount * yarnData.amountPerSkein;
            const newRemainingAmount = totalAvailable - projectData.amountUsed;

            await updateDoc(yarnRef, {
                remainingAmount: newRemainingAmount,
                usedInProjects: arrayUnion(projectId)
            });
        }

        navigate("/projects")
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
                state={{ from: location.pathname }}
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

            {/* File Input */}
            <input type="file" accept="image/*" onChange={handleFileChange} />

            {/* Image Preview */}
            {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}

            <br />
            <br />

            <button>Submit</button>

        </form>
    )
}