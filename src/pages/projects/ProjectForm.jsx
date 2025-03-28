import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from "react-router-dom"
import { YarnContext } from '../../contexts/YarnContext';
import { deleteImage } from "../../api"
import FileInput from "../../components/FileInput"

export default function ProjectForm({ projectFormData, onSubmit, isEditMode }) {
    const navigate = useNavigate()
    const location = useLocation()
    const returnPath = location.state?.from || "/projects";
    const [loading, setLoading] = useState(false);

    const { yarnStash } = useContext(YarnContext)
    const [projectData, setProjectData] = useState(projectFormData);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false)

    // Update projectData if location.state has projectFormData
    useEffect(() => {
        if (location.state?.projectFormData) {
            setProjectData(location.state.projectFormData);
            if (projectData.image?.imageUrl) {
                setPreview(projectData.image.imageUrl);
            }
        }
    }, [location.state, projectData]);

    function handleChange(event) {
        const { name, value } = event.target
        if (name === "yarnUsed") {
            const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
            setProjectData(prevProjectData => ({
                ...prevProjectData,
                yarnUsed: selectedOptions
            }));
        } else {
            setProjectData(prevProjectData => ({
                ...prevProjectData,
                [name]: value
            }));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true);

        try {
            // If user removed the image in edit mode, delete it from Cloudinary
            if (isEditMode && imageRemoved && projectData.image?.imagePublicId) {
                console.log("Removing image with public ID:", projectData.image.imagePublicId); // Debug log
                await deleteImage(projectData.image.imagePublicId);
            }

            // Pass updated form data to onSubmit
            await onSubmit(projectData, selectedFile)
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false)
            navigate(returnPath)
        }

    }

    return (
        <div>
            <Link
                to={"/projects"}
                className="back-button"
            >&larr; <span>Back to Projects</span></Link>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    name="name"
                    value={projectData.name}
                    required
                />

                <fieldset>
                    <legend>Status</legend>

                    <input
                        type="radio"
                        id="workInProgress"
                        name="status"
                        value="Work In Progress"
                        checked={projectData.status === "Work In Progress"}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="workInProgress">Work in Progress</label>
                    <br />

                    <input
                        type="radio"
                        id="completed"
                        name="status"
                        value="Completed"
                        checked={projectData.status === "Completed"}
                        onChange={handleChange}
                    />
                    <label htmlFor="completed">Completed</label>
                    <br />

                    <input
                        type="radio"
                        id="abandoned"
                        name="status"
                        value="Abandoned"
                        checked={projectData.status === "Abandoned"}
                        onChange={handleChange}
                    />
                    <label htmlFor="abandoned">Abandoned</label>
                    <br />

                    <input
                        type="radio"
                        id="frogged"
                        name="status"
                        value="Frogged"
                        checked={projectData.status === "Frogged"}
                        onChange={handleChange}
                    />
                    <label htmlFor="frogged">Frogged</label>
                    <br />
                </fieldset>
                <br />

                <label htmlFor="yarnUsed">Select yarn: </label>
                <br />
                <select
                    id="yarnUsed"
                    multiple
                    value={projectData.yarnUsed}
                    onChange={handleChange}
                    name="yarnUsed"
                    required
                >
                    {yarnStash.map(yarn => (
                        <option key={yarn.id} value={yarn.id}>
                            {yarn.name}
                        </option>
                    ))}
                </select>
                <Link
                    to="../addYarn"
                    state={{
                        from: location.pathname,
                        projectFormData: projectData,
                        selectedFile,
                        preview
                    }}
                >
                    or <u>Add New Yarn</u>
                </Link>

                <br />
                <br />

                <label htmlFor="amountUsed">Amount used: </label>
                <input
                    type="number"
                    placeholder="Amount used oz"
                    onChange={handleChange}
                    name="amountUsed"
                    id="amountUsed"
                    value={projectData.amountUsed}
                />

                <br />
                <br />

                <label htmlFor="notes">Notes: </label>
                <textarea
                    placeholder="Notes"
                    onChange={handleChange}
                    name="notes"
                    id="notes"
                    value={projectData.notes}
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
                    {loading ? "Saving..." : isEditMode ? "Update Project" : "Add Project"}
                </button>

            </form>
        </div>
    )
}