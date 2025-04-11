require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete yarn (and image if included)
app.delete("/delete-yarn/:id", async (req, res) => {
  const yarnId = req.params.id;
  const { imagePublicId } = req.body;

  try {
    const yarnRef = db.collection("yarn").doc(yarnId);
    const yarnSnap = await yarnRef.get();

    if (!yarnSnap.exists) {
      return res.status(404).json({ error: "Yarn not found" });
    }

    const yarnData = yarnSnap.data();

    // Step 1: Update each related projects's yarnUsed field
    const projectUpdatePromises = yarnData.usedInProjects.map(
      async (projectEntry) => {
        const projectRef = db
          .collection("projects")
          .doc(projectEntry.projectId);
        await projectRef.update({
          yarnUsed: admin.firestore.FieldValue.arrayRemove(yarnId),
        });
      },
    );

    await Promise.all(projectUpdatePromises);

    // Step 2: Delete the image from Cloudinary
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }
    // Step 3: Delete the yarn from Firestore
    await yarnRef.delete();

    res
      .status(200)
      .json({ message: "Yarn and related project updates completed" });
  } catch (error) {
    console.error("Error deleting yarn or image:", error);
    res
      .status(500)
      .json({ error: "Failed to delete yarn and project yarn references" });
  }
});

// Delete project (and image if included) and update yarn's usedInProjects
app.delete("/delete-project/:id", async (req, res) => {
  const projectId = req.params.id;
  const { imagePublicId } = req.body;

  try {
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectData = projectSnap.data();

    // Step 1: Update each related yarn's usedInProjects field
    const yarnUpdatePromises = projectData.yarnUsed.map(async (yarnEntry) => {
      const yarnRef = db.collection("yarn").doc(yarnEntry.yarnId);
      await yarnRef.update({
        usedInProjects: admin.firestore.FieldValue.arrayRemove(projectId),
      });
    });

    await Promise.all(yarnUpdatePromises);

    // Step 2: Delete the image from Cloudinary
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }

    // Step 3: Delete the project from Firestore
    await projectRef.delete();

    res
      .status(200)
      .json({ message: "Project and related yarn updates completed" });
  } catch (error) {
    console.error("Error deleting project or image:", error);
    res
      .status(500)
      .json({ error: "Failed to delete project and update yarn references" });
  }
});

// Delete image
app.delete("/delete-image/", async (req, res) => {
  const { imagePublicId } = req.body;
  if (!imagePublicId) {
    return res.status(400).json({ error: "Missing imagePublicId" });
  }
  try {
    // Delete the image from Cloudinary
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

app.get("/api", (req, res) => {
  res.json("Hello, welcome to our API!");
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
