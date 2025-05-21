import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, runTransaction } from "firebase/firestore";
import ProjectForm from "./ProjectForm";

export default function EditProject() {
  const { projectId } = useParams();
  const location = useLocation();

  const [projectData, setProjectData] = useState({
    name: "",
    status: "",
    yarnUsed: [],
    amountUsed: 0,
    notes: "",
  });

  // Update projectData if location.state has projectFormData
  useEffect(() => {
    async function fetchProjectData() {
      if (location.state?.projectFormData) {
        setProjectData(location.state.projectFormData);
      }
    }
    fetchProjectData();
  }, [location.state]);

  // Function to handle editing a projec
  async function handleEditProject(updatedData, selectedFile) {
    let imageUrl = "";
    let imagePublicId = "";

    try {
      // Handle image upload first if there's a file
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_PRESET_NAME
        );
        formData.append(
          "cloud_name",
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        );

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
        // Get all yarn references and their current data
        const oldYarns = projectData.yarnUsed || [];
        const newYarns = updatedData.yarnUsed || [];

        // Get unique yarn IDs from both old and new yarns
        const uniqueYarnIds = Array.from(
          new Set([
            ...oldYarns.map((y) => y.yarnId),
            ...newYarns.map((y) => y.yarnId),
          ])
        );

        // Fetch all yarn documents
        const yarnRefs = uniqueYarnIds.map((id) => doc(db, "yarn", id));
        const yarnDocs = await Promise.all(
          yarnRefs.map((ref) => transaction.get(ref))
        );

        // Update project document
        const projectRef = doc(db, "projects", projectId);
        transaction.update(projectRef, {
          ...updatedData,
          image: {
            imageUrl: imageUrl || projectData.image?.imageUrl || "",
            imagePublicId:
              imagePublicId || projectData.image?.imagePublicId || "",
          },
          updatedAt: longDateFormat,
        });

        // Update all involved yarns
        for (let i = 0; i < yarnDocs.length; i++) {
          const yarnSnap = yarnDocs[i];
          const yarnId = uniqueYarnIds[i];

          if (!yarnSnap.exists()) {
            throw new Error(`Yarn with ID ${yarnId} not found`);
          }

          // Get current data
          const yarnData = yarnSnap.data();
          const yarnRef = yarnRefs[i];

          // Remove old entry for this project
          let updatedUsedInProjects = (yarnData.usedInProjects || []).filter(
            (entry) => entry.projectId !== projectId
          );

          // Add new entry if this yarn is still selected
          const newYarnEntry = newYarns.find((y) => y.yarnId === yarnId);
          if (newYarnEntry) {
            updatedUsedInProjects.push({
              projectId,
              amount: Number(newYarnEntry.amount),
            });
          }

          // Calculate new remaining amount
          const skeinAmount = yarnData.skeinAmount || 0;
          const amountPerSkein = yarnData.amountPerSkein || 0;
          const totalAvailable = skeinAmount * amountPerSkein;
          const totalUsed = updatedUsedInProjects.reduce(
            (sum, entry) => sum + entry.amount,
            0
          );
          const newRemaining = totalAvailable - totalUsed;

          // If new yarn entry and remaining is negative, ask for confirmation
          if (newYarnEntry && newRemaining < 0) {
            const confirm = window.confirm(
              `Warning: Using ${newYarnEntry.amount}oz of this yarn will result in a negative remaining amount. Continue?`
            );
            if (!confirm)
              throw new Error("User cancelled due to negative yarn usage.");
          }

          // Update yarn document
          transaction.update(yarnRef, {
            usedInProjects: updatedUsedInProjects,
            remainingAmount: newRemaining,
          });
        }
      });
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  }

  return (
    <ProjectForm
      projectFormData={projectData}
      onSubmit={handleEditProject}
      isEditMode={true}
    />
  );
}
