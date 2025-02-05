import React, { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { yarnCollection } from "../../api"
import { addDoc } from "firebase/firestore"
import UploadWidget from "../../components/UploadWidget"

export default function AddYarn() {
    const [yarnData, setYarnData] = React.useState(
        {
            name: "",
            color: "",
            material: "",
            weight: "",
            amountPerSkein: 0,
            skeinAmount: 0,
            image: "",
            usedInProjects: null,
            amountAvailable: 0
        }
    )
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.from || "/stash"; 
    const [loading, setLoading] = React.useState(false)

    const cloudinaryRef = useRef()
    const widgetRef = useRef()
    const [selectedFile, setSelectedFile] = React.useState(null)

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: import.meta.env.VITE_CLOUD_NAME,
            uploadPreset: import.meta.env.VITE_PRESET_NAME,
            multiple: false
        }, function (error, result) {
            if (!error && result.event === "success") {
                setSelectedFile(result.info.secure_url); // Store selected image URL in state
                setYarnData(prevYarnData => {
                    return {
                        ...prevYarnData,
                        image: result.info.secure_url,
                        imagePublicId: result.info.public_id
                    }
                })
            }
        })
    }, [])

    function handleChange(event) {
        const { name, value } = event.target
        setYarnData(prevYarnData => {
            return {
                ...prevYarnData,
                [name]: value
            }
        })
    }

    async function handleSubmit(event) {
        event.preventDefault() //prevent refresh and resetting inputs 

        /* if (!selectedFile) {
            alert("Please select an image before submitting.");
            return;
        }
 */
        const newYarn = {
            ...yarnData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            amountAvailable: yarnData.amountPerSkein * yarnData.skeinAmount
        }

        const docRef = await addDoc(yarnCollection, newYarn)
        navigate(returnPath, {
            state: {
                newYarn: {
                    id: docRef.id,
                    name: yarnData.name
                }
            }
        })
    }


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    name="name"
                    value={yarnData.name}
                />
                <input
                    type="text"
                    placeholder="Color"
                    onChange={handleChange}
                    name="color"
                    value={yarnData.color}
                />
                <input
                    type="text"
                    placeholder="Material"
                    onChange={handleChange}
                    name="material"
                    value={yarnData.material}
                />
                <input
                    type="text"
                    placeholder="Weight"
                    onChange={handleChange}
                    name="weight"
                    value={yarnData.weight}
                />
                <input
                    type="number"
                    placeholder="Amount per skein oz"
                    onChange={handleChange}
                    name="amountPerSkein"
                    value={yarnData.amountPerSkein}
                />
                <input
                    type="number"
                    placeholder="Skein amount"
                    name="skeinAmount"
                    onChange={handleChange}
                    value={yarnData.skeinAmount}
                />

                <button type="button" onClick={() => widgetRef.current.open()}>Select Image</button>
                {selectedFile && <img src={selectedFile} alt="Selected Yarn" style={{ width: "100px", marginTop: "10px" }} />}

                <br />
                <br />
                {
                    loading
                        ? "Uploading..."
                        : <button type="submit">
                            Submit
                        </button>
                }
            </form>
        </div>
    )
}