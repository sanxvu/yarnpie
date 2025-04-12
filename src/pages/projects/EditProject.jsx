import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
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

  async function handleEditProject(updatedData, selectedFile) {
    let imageUrl = "";
    let imagePublicId = "";

    // Upload image if provided
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_PRESET_NAME
      );
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      try {
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
        console.log("Edit project image success", data);
      } catch (error) {
        console.error("Image upload error:", error);
        return;
      }
    }

    const now = Date.now();
    const date = new Date(now);
    const longDateFormat = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Update project
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, {
      ...updatedData,
      image: {
        imageUrl,
        imagePublicId,
      },
      updatedAt: longDateFormat,
    });

    // Update each yarn's usedInProjects and remainingAmount
    for (const yarnData of projectData.yarnUsed) {
      const { yarnId, amount } = yarnData;
      const yarnRef = doc(db, "yarn", yarnId);
      const yarnSnap = await getDoc(yarnRef);

      if (!yarnSnap.exists()) {
        console.warn(`Yarn ${yarnId} not found, skipping update`);
        continue;
      }

      const yarn = yarnSnap.data();

      // Remove previous entry for this project
      const updatedUsedInProjects = (yarn.usedInProjects || []).filter(
        (entry) => entry.projectId !== projectId
      );

      // Add updated entry
      updatedUsedInProjects.push({
        projectId,
        amount: Number(amount),
      });

      // Recalculate remainingAmount
      const totalAvailable = yarnData.skeinAmount * yarnData.amountPerSkein;
      const totalUsed = updatedUsedInProjects.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
      const newRemaining = totalAvailable - totalUsed;

      await updateDoc(yarnRef, {
        usedInProjects: updatedUsedInProjects,
        remainingAmount: newRemaining,
      });
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
