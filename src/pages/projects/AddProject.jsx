import { useState } from "react";
import { db } from "../../firebase/firebase";
import { projectsCollection } from "../../api";
import { doc, runTransaction, collection } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import ProjectForm from "./ProjectForm";

export default function AddProject() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [projectData, setProjectData] = useState({
    name: "",
    status: "",
    yarnUsed: [],
    amountUsed: 0,
    notes: "",
  });

  async function handleAddProject(projectData, selectedFile) {
    setLoading(true);
    let imageUrl = "";
    let imagePublicId = "";

    try {
      // Handle image upload first if there's a file
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
        formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        imageUrl = data.secure_url;
        imagePublicId = data.public_id;
      }

      // Get current date in long format
      const now = new Date();
      const longDateFormat = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Run the transaction
      await runTransaction(db, async (transaction) => {
        // Create a new project reference
        const projectRef = doc(collection(db, "projects"));
        
        // Get all yarn references and their current data
        const yarnRefs = projectData.yarnUsed.map(yarn => 
          doc(db, "yarn", yarn.yarnId)
        );
        
        // Fetch all yarn documents
        const yarnDocs = await Promise.all(
          yarnRefs.map(ref => transaction.get(ref))
        );

        // Verify all yarns exist
        yarnDocs.forEach((doc, idx) => {
          if (!doc.exists()) {
            throw new Error(`Yarn with ID ${projectData.yarnUsed[idx].yarnId} not found`);
          }
        });

        // Update each yarn's data within the transaction
        projectData.yarnUsed.forEach((yarnData, idx) => {
          const yarnDoc = yarnDocs[idx];
          const yarnInfo = yarnDoc.data();
          
          // Calculate the new remaining amount
          const totalAvailable = yarnInfo.skeinAmount * yarnInfo.amountPerSkein;
          const currentUsed = (yarnInfo.usedInProjects || [])
            .reduce((sum, project) => sum + project.amount, 0);
          const newUsed = currentUsed + Number(yarnData.amount);

          // Check if the new used amount is greater than the total available
          if (newUsed > totalAvailable) {
            throw new Error(
              `Not enough yarn available for ${yarnInfo.name}. Available: ${totalAvailable - currentUsed}oz, Attempted to use: ${yarnData.amount}oz`
            );
          }

          // Update the yarn document
          transaction.update(yarnRefs[idx], {
            usedInProjects: [
              ...(yarnInfo.usedInProjects || []),
              { projectId: projectRef.id, amount: Number(yarnData.amount) }
            ],
            remainingAmount: totalAvailable - newUsed
          });
        });

        // Create the new project document
        transaction.set(projectRef, {
          ...projectData,
          userId: currentUser?.uid || "",
          image: {
            imageUrl,
            imagePublicId,
          },
          createdAt: longDateFormat,
          updatedAt: longDateFormat,
        });
      });

    } catch (error) {
      console.error("Failed to add project:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProjectForm
      projectFormData={projectData}
      onSubmit={handleAddProject}
      isEditMode={false}
      loading={loading}
    />
  );
}
