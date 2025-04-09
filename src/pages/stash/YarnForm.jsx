import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { deleteImage } from "../../api"
import FileInput from "../../components/FileInput"
import '../../components/Form.css';

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
        <div className="form-container">
            <Link
                to={returnPath}
                state={{
                    projectFormData: location.state?.projectFormData
                }}
                className="back-button"
            >&larr; <span>Back to stash</span></Link>

            <main className="add-edit-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Yarn Name</label>
                        <input
                            type="text"
                            id="name"
                            onChange={handleChange}
                            name="name"
                            value={yarnData.name}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="color">Color</label>
                        <input
                            type="text"
                            id="color"
                            onChange={handleChange}
                            name="color"
                            value={yarnData.color}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="material">Material</label>
                        <input
                            type="text"
                            id="material"
                            onChange={handleChange}
                            name="material"
                            value={yarnData.material}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="weight">Weight</label>
                        <input
                            type="text"
                            id="weight"
                            onChange={handleChange}
                            name="weight"
                            value={yarnData.weight}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amountPerSkein">Amount per skein (oz)</label>
                        <input
                            type="number"
                            id="amountPerSkein"
                            onChange={handleChange}
                            name="amountPerSkein"
                            value={yarnData.amountPerSkein}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="skeinAmount">Skein Amount</label>
                        <input
                            type="number"
                            id="skeinAmount"
                            placeholder="Skein amount"
                            name="skeinAmount"
                            onChange={handleChange}
                            value={yarnData.skeinAmount}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file-input">Set cover picture: </label>
                        <FileInput
                            selectedFile={selectedFile}
                            preview={preview}
                            setSelectedFile={setSelectedFile}
                            setPreview={setPreview}
                            imageRemoved={imageRemoved}
                            setImageRemoved={setImageRemoved}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : isEditMode ? "Update Yarn" : "Add Yarn"}
                    </button>
                </form>
            </main>
        </div>
    )
}