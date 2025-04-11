import { useState } from "react"
import { addDoc } from "firebase/firestore"
import { yarnCollection } from "../../api"
import { useAuth } from "../../contexts/AuthContext"
import YarnForm from "./YarnForm"

export default function AddYarn() {
    const { currentUser } = useAuth()

    const [yarnData, setYarnData] = useState(
        {
            name: "",
            color: "",
            material: "",
            weight: "",
            amountPerSkein: 0,
            skeinAmount: 0,
            usedInProjects: [],
            amountAvailable: 0,
        }
    )

    async function handleAddYarn(yarnData, selectedFile) {
        let imageUrl = "";
        let imagePublicId = "";

         // Upload image if provided
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

        const now = Date.now();
        const date = new Date(now);
        const longDateFormat = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create new yarn data
        const newYarn = {
            ...yarnData,
            userId: currentUser?.uid || "",
            image: {
                imageUrl,
                imagePublicId,
            },
            createdAt: longDateFormat,
            updatedAt: longDateFormat,
            amountAvailable: yarnData.amountPerSkein * yarnData.skeinAmount
        }

        // Add the new yarn to Firestore
        await addDoc(yarnCollection, newYarn)
    }

    return (
        <YarnForm yarnFormData={yarnData} projectFormData={location.state?.projectFormData} onSubmit={handleAddYarn} isEditMode={false} />
    )
}