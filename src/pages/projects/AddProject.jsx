import { useState } from 'react';
import { db } from "../../firebase/firebase"
import { projectsCollection } from "../../api"
import { doc, getDoc, updateDoc, addDoc, arrayUnion } from "firebase/firestore"
import { useAuth } from "../../contexts/AuthContext"
import ProjectForm from "./ProjectForm"

export default function AddProject() {
    const { currentUser } = useAuth()

    const [projectData, setProjectData] = useState({
        name: "",
        status: "",
        yarnUsed: [],
        amountUsed: 0,
        notes: ""
    })

    async function handleAddProject(projectData, selectedFile) {
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
                console.log("Add project success:", data)
            } catch (error) {
                console.error("Image upload error:", error);
                return;
            }
        }

        const newProject = {
            ...projectData,
            userId: currentUser?.uid || "",
            image: {
                imageUrl,
                imagePublicId,
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        const projectRef = await addDoc(projectsCollection, newProject)
        const projectId = projectRef.id

        // Update each yarn's usedInProjects and remainingAmount
        for (const yarnId of projectData.yarnUsed) {
            const yarnRef = doc(db, "yarn", yarnId);
            const yarnSnap = await getDoc(yarnRef);

            if (yarnSnap.exists()) {
                const yarnData = yarnSnap.data();
                const totalAvailable = yarnData.skeinAmount * yarnData.amountPerSkein;
                const newRemainingAmount = totalAvailable - projectData.amountUsed;

                await updateDoc(yarnRef, {
                    remainingAmount: newRemainingAmount,
                    usedInProjects: arrayUnion(projectId)
                });
            }
        }
    }

    return (
        <ProjectForm projectFormData={projectData} onSubmit={handleAddProject} isEditMode={false} />
    )
}