import { useState, useEffect } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { db } from "../../firebase/firebase"
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore"
import ProjectForm from "./ProjectForm"

export default function EditProject() {
    const { projectId } = useParams()
    const location = useLocation()

    const [projectData, setProjectData] = useState({
        name: "",
        status: "",
        yarnUsed: [],
        amountUsed: 0,
        notes: ""
    });

    // Update projectData if location.state has projectFormData
    useEffect(() => {
        async function fetchProjectData() {
            if (location.state?.projectFormData) {
                setProjectData(location.state.projectFormData);
            }
        }
        fetchProjectData()
    }, [location.state]);

    async function handleEditProject(updatedData, selectedFile) {
        let imageUrl = "";
        let imagePublicId = "";

        if (!updatedData.yarnUsed) {
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
                console.log("Edit project image success", data)
            } catch (error) {
                console.error("Image upload error:", error);
                return;
            }
        }

        // Update project
        const docRef = doc(db, "projects", projectId)
        await updateDoc(docRef, {
            ...updatedData,
            image: {
                imageUrl,
                imagePublicId,
            }
        })

        // Update yarn's usedInProjects and remainingAmount
        for (const yarnId of projectData.yarnUsed) {
            const yarnRef = doc(db, "yarn", yarnId)
            const yarnSnap = await getDoc(yarnRef)

            if (yarnSnap.exists()) {
                const yarnData = yarnSnap.data();
                const totalAvailable = yarnData.skeinAmount * yarnData.amountPerSkein;
                const newRemainingAmount = totalAvailable - updatedData.amountUsed;

                await updateDoc(yarnRef, {
                    remainingAmount: newRemainingAmount,
                    usedInProjects: arrayUnion(projectId)
                });
            }
        }
    }

    return (
        <ProjectForm projectFormData={projectData} onSubmit={handleEditProject} isEditMode={true} />
    )
}