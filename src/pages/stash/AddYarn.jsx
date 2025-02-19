import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { addDoc } from "firebase/firestore"
import { yarnCollection } from "../../api"

export default function AddYarn() {
    const [yarnData, setYarnData] = React.useState(
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
    const [loading, setLoading] = React.useState(false)

    const [selectedFile, setSelectedFile] = React.useState(null)
    const [preview, setPreview] = React.useState(null);

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
            setPreview(URL.createObjectURL(file)); // Show preview before upload
        }
    }

    async function handleSubmit(event) {
        event.preventDefault() //prevent refresh and resetting inputs 

        setLoading(true);

        let imageUrl = "";
        let imagePublicId = "";

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

        const newYarn = {
            ...yarnData,
            image: imageUrl || "",
            imagePublicId: imagePublicId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            amountAvailable: yarnData.amountPerSkein * yarnData.skeinAmount
        }

        const docRef = await addDoc(yarnCollection, newYarn)
        navigate(returnPath, {
            state: {
                newYarn: {
                    id: docRef.id,
                    name: yarnData.name
                }
            }
        })
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


                {/* File Input */}
                <input type="file" accept="image/*" onChange={handleFileChange} />

                {/* Image Preview */}
                {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}

                <br />
                <br />
                {
                    loading
                        ? "Uploading..."
                        : <button type="submit">
                            Submit
                        </button>
                }
            </form>
        </div>
    )
}