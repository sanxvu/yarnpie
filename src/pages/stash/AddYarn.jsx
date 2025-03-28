import { useState } from "react"
import { addDoc } from "firebase/firestore"
import { yarnCollection } from "../../api"
import { useAuth } from "../../contexts/AuthContext"
import YarnForm from "./YarnForm"

export default function AddYarn() {
    const { currentUser } = useAuth()
    const returnPath = location.state?.from || "/stash";

    const [yarnData, setYarnData] = useState(
        {
            name: "",
            color: "",
            material: "",
            weight: "",
            amountPerSkein: 0,
            skeinAmount: 0,
            usedInProjects: null,
            amountAvailable: 0,
        }
    )

    async function handleAddYarn(yarnData, selectedFile) {
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
                imageUrl = data.secure_url;
                imagePublicId = data.public_id;
                console.log("Add yarn success:", data)
            } catch (error) {
                console.error("Image upload error:", error);
                return;
            }
        }

        const newYarn = {
            ...yarnData,
            userId: currentUser?.uid || "",
            image: {
                imageUrl,
                imagePublicId,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            amountAvailable: yarnData.amountPerSkein * yarnData.skeinAmount
        }

        await addDoc(yarnCollection, newYarn)
    }

    return (
        <YarnForm yarnFormData={yarnData} projectFormData={location.state?.projectFormData} onSubmit={handleAddYarn} isEditMode={false} />
    )
}