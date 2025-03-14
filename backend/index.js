require("dotenv").config(); 
const express = require("express")
const cors = require("cors")
const admin = require("firebase-admin")
const path = require('path')

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const cloudinary = require("cloudinary").v2;

const app = express()
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete yarn, and image if included
app.delete("/delete-yarn/:id", async (req, res) => {
    const yarnId = req.params.id;
    const { imagePublicId } = req.body;

    try {
        // Step 1: Delete the image from Cloudinary
        if (imagePublicId) {
            await cloudinary.uploader.destroy(imagePublicId);
        }
        // Step 2: Delete the yarn from Firestore
        const yarnRef = db.collection("yarn").doc(yarnId);
        await yarnRef.delete();

        res.status(200).json({ message: "Yarn and image deleted successfully" });
    } catch (error) {
        console.error("Error deleting yarn or image:", error);
        res.status(500).json({ error: "Failed to delete yarn and image" });
    }
});

// Delete project, and iamge if included
app.delete("/delete-project/:id", async (req, res) => {
    const projectId = req.params.id;
    const { imagePublicId } = req.body;

    try {
        // Step 1: Delete the image from Cloudinary
        if (imagePublicId) {
            await cloudinary.uploader.destroy(imagePublicId);
        }
        // Step 2: Delete the yarn from Firestore
        const projectRef = db.collection("projects").doc(projectId);
        await projectRef.delete();

        res.status(200).json({ message: "Project and image deleted successfully" });
    } catch (error) {
        console.error("Error deleting project or image:", error);
        res.status(500).json({ error: "Failed to delete project and image" });
    }
});

app.get("/api", (req, res) => {
    res.json({ "fruits": ["apple", "orange", "banana"] })
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});