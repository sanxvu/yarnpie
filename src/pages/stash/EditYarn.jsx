import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"

export default function EditYarn() {
    const [yarnData, setYarnData] = useState(
        {
            name: "",
            color: "",
            material: "",
            weight: "",
            amountPerSkein: 0,
            skeinAmount: 0,
            image: "",
            usedInProjects: null,
            amountAvailable: 0
        }
    )
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.from || "/stash";
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null);

    // Update yarnData form if location.state has formData
    useEffect(() => {
        console.log(location.state)

        if (location.state?.formData) {
            setYarnData(location.state.formData);
        }
    }, [location.state]);

    function handleChange(event) {
        const { name, value } = event.target
        setYarnData(prevYarnData => {
            return {
                ...prevYarnData,
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

        let imageUrl = yarnData.imageUrl || "";
        let imagePublicId = yarnData.imagePublicId || "";

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
                imageUrl = data.secure_url;
                imagePublicId = data.public_id;
                console.log(data)
            } catch (error) {
                console.error("Image upload error:", error);
                setLoading(false);
                return;
            }
        }

        // Update yarn 
        const docRef = doc(db, "yarn", location.state.yarnId)
        await setDoc(
            docRef,
            {
                ...yarnData,
                image: imageUrl,
                imagePublicId: imagePublicId,
            }
        )

        // Return back to Stash page
        navigate(returnPath)
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    name="name"
                    value={yarnData.name}
                />
                <input
                    type="text"
                    placeholder="Color"
                    onChange={handleChange}
                    name="color"
                    value={yarnData.color}
                />
                <input
                    type="text"
                    placeholder="Material"
                    onChange={handleChange}
                    name="material"
                    value={yarnData.material}
                />
                <input
                    type="text"
                    placeholder="Weight"
                    onChange={handleChange}
                    name="weight"
                    value={yarnData.weight}
                />
                <input
                    type="number"
                    placeholder="Amount per skein oz"
                    onChange={handleChange}
                    name="amountPerSkein"
                    value={yarnData.amountPerSkein}
                />
                <input
                    type="number"
                    placeholder="Skein amount"
                    name="skeinAmount"
                    onChange={handleChange}
                    value={yarnData.skeinAmount}
                />

                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}

                <br />
                <br />

                <button type="submit">
                    Submit edits
                </button>
            </form>
        </div>
    )
}