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
                imageUrl = data.secure_url; // Get image URL
                imagePublicId = data.public_id; //Get public_id 
                console.log("Add project success:", data)
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

        // Create new project data
        const newProject = {
            ...projectData,
            userId: currentUser?.uid || "",
            image: {
                imageUrl,
                imagePublicId,
            },
            createdAt: longDateFormat,
            updatedAt: longDateFormat
        }

        // Add the new project to Firestore
        const projectRef = await addDoc(projectsCollection, newProject)
        const projectId = projectRef.id

        // Update each yarn's usedInProjects and remainingAmount
        for (const yarnData of projectData.yarnUsed) {
            const { yarnId, amount } = yarnData;
            const yarnRef = doc(db, "yarn", yarnId);
            const yarnSnap = await getDoc(yarnRef);

            if (yarnSnap.exists()) {
                const yarnInfo = yarnSnap.data();
                const totalAvailable = yarnInfo.skeinAmount * yarnInfo.amountPerSkein;
                const newRemainingAmount = totalAvailable - amount;

                // Store projectId AND amount used in this yarn
                const usedEntry = { projectId, amount: Number(amount) };

                await updateDoc(yarnRef, {
                    remainingAmount: newRemainingAmount,
                    usedInProjects: arrayUnion(usedEntry)
                });
            }
        }
    }

    return (
        <ProjectForm projectFormData={projectData} onSubmit={handleAddProject} isEditMode={false} />
    )
}