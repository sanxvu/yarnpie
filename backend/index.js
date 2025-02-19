const express = require("express")
const cors = require("cors")
const admin = require("firebase-admin")
const path = require('path')

// Path to your service account file
const serviceAccount = require("./yarnies-firebase-adminsdk-fbsvc-697b7a316a.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load environment variables

const app = express()
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.delete("/delete-yarn/:id", async (req, res) => {
    console.log("Received DELETE request for yarn ID:", req.params.id);
    console.log("Request body:", req.body);

    const yarnId = req.params.id;
    const { imagePublicId } = req.body; // Public ID of the image in Cloudinary

    if (!imagePublicId) {
        return res.status(400).json({ error: "Image public ID is required" });
    }

    try {
        // Step 1: Delete the image from Cloudinary
        await cloudinary.uploader.destroy(imagePublicId);

        // Step 2: Delete the yarn from Firestore
        const yarnRef = db.collection("yarn").doc(yarnId);
        await yarnRef.delete();

        res.status(200).json({ message: "Yarn and image deleted successfully" });
    } catch (error) {
        console.error("Error deleting yarn or image:", error);
        res.status(500).json({ error: "Failed to delete yarn and image" });
    }
});

app.get("/api", (req, res) => {
    res.json({ "fruits": ["apple", "orange", "banana"] })
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});