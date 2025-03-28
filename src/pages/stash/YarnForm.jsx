import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { deleteImage } from "../../api"
import FileInput from "../../components/FileInput"

export default function YarnForm({ yarnFormData, projectFormData, onSubmit, isEditMode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.from || "/stash";
    const [loading, setLoading] = useState(false);

    const [yarnData, setYarnData] = useState(yarnFormData);

    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false)

    // Update yarnData form if location.state has yarnFormData
    useEffect(() => {
        if (location.state?.yarnFormData) {
            setYarnData(location.state.yarnFormData);
            if (yarnData.image?.imageUrl) {
                setPreview(yarnData.image.imageUrl);
            }
        }
    }, [location.state, yarnData]);

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
        event.preventDefault()
        setLoading(true);

        try {
            // If user removed the image in edit mode, delete it from Cloudinary
            if (isEditMode && imageRemoved && yarnData.image?.imagePublicId) {
                console.log("Removing image with public ID:", yarnData.image.imagePublicId); // Debug log
                await deleteImage(yarnData.image.imagePublicId);
            }

            // Pass updated form data to onSubmit
            await onSubmit(yarnData, selectedFile)
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
            navigate(returnPath, {
                state: { projectFormData: location.state?.projectFormData }
            })
        }
    }

    return (
        <div>
            <Link
                to={returnPath}
                state={{
                    projectFormData: location.state?.projectFormData
                }}
                className="back-button"
            >&larr; <span>Back</span></Link>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    name="name"
                    value={yarnData.name}
                    required
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

                <br /><br />

                <FileInput
                    selectedFile={selectedFile}
                    preview={preview}
                    setSelectedFile={setSelectedFile}
                    setPreview={setPreview}
                    imageRemoved={imageRemoved}
                    setImageRemoved={setImageRemoved}
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditMode ? "Update Yarn" : "Add Yarn"}
                </button>
            </form>
        </div>
    )
}