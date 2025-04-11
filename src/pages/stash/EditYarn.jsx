import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate, Link } from "react-router-dom"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import YarnForm from "./YarnForm"

export default function EditYarn() {
    const { yarnId } = useParams()
    const location = useLocation()

    const [yarnData, setYarnData] = useState(
        {
            name: "",
            color: "",
            material: "",
            weight: "",
            amountPerSkein: 0,
            skeinAmount: 0,
            image: "",
            usedInProjects: [],
            amountAvailable: 0
        }
    )

    // Update yarnData if location.state has yarnFormData
    useEffect(() => {
        async function fetchYarnData() {
            if (location.state?.yarnFormData) {
                setYarnData(location.state.yarnFormData);
            }
        }
        fetchYarnData()
    }, [location.state]);

    async function handleEditYarn(yarnData, selectedFile) {

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
                console.log("Edit yarn image success", data)
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

        // Update yarn 
        const docRef = doc(db, "yarn", yarnId)
        await setDoc(
            docRef,
            {
                ...yarnData,
                image: {
                    imageUrl,
                    imagePublicId,
                },
                updatedAt: longDateFormat
            }
        )
    }

    return (
        <YarnForm yarnFormData={yarnData} onSubmit={handleEditYarn} isEditMode={true} />
    )
}