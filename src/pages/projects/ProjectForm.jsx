import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from "react-router-dom"
import { YarnContext } from '../../contexts/YarnContext';
import { deleteImage } from "../../api"
import FileInput from "../../components/FileInput"
import '../../components/Form.css';
import Select from "react-select";

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

    // Transform yarn stash into options
    const yarnOptions = yarnStash.map(yarn => ({
        value: yarn.id,
        label: yarn.name
    }));

    const handleYarnChange = (selectedOptions) => {
        setProjectData(prevProjectData => ({
            ...prevProjectData,
            yarnUsed: selectedOptions.map(option => option.value),
        }));
    };

    return (
        <div className="form-container">
            <Link
                to={"/projects"}
                className="back-button"
            >&larr; <span>Back to Projects</span></Link>
            
            <main className="add-edit-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Project Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={projectData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-fieldset-group">
                        <label htmlFor="status-fieldset">Status</label>
                        <fieldset id="status-fieldset">
                            {["Work In Progress", "Completed", "Abandoned", "Frogged"].map(status => {
                                const id = status.toLowerCase().replace(/\s+/g, '');
                                return (
                                    <div key={id} className="radio-option">
                                        <input
                                            type="radio"
                                            id={id}
                                            name="status"
                                            value={status}
                                            checked={projectData.status === status}
                                            onChange={handleChange}
                                            required
                                        />
                                        <label htmlFor={id}>{status}</label>
                                    </div>
                                );
                            })}
                        </fieldset>
                    </div>

                    <div className="form-group">
                        <label htmlFor="yarnUsed">Select yarn:</label>
                        <Select
                            id="yarnUsed"
                            isMulti
                            name="yarnUsed"
                            options={yarnOptions}
                            value={projectData.yarnUsed.map(yarnId => yarnOptions.find(opt => opt.value === yarnId))}
                            onChange={handleYarnChange}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        <Link
                            to="../addYarn"
                            state={{
                                from: location.pathname,
                                projectFormData: projectData,
                                selectedFile,
                                preview
                            }}
                        >
                            or Add New Yarn
                        </Link>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amountUsed">Amount used (oz): </label>
                        <input
                            type="number"
                            onChange={handleChange}
                            name="amountUsed"
                            id="amountUsed"
                            value={projectData.amountUsed}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes: </label>
                        <textarea
                            onChange={handleChange}
                            name="notes"
                            id="notes"
                            value={projectData.notes}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file-input">Set cover picture: </label>
                        <FileInput
                            id="file-input"
                            selectedFile={selectedFile}
                            preview={preview}
                            setSelectedFile={setSelectedFile}
                            setPreview={setPreview}
                            imageRemoved={imageRemoved}
                            setImageRemoved={setImageRemoved}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : isEditMode ? "Update Project" : "Add Project"}
                    </button>

                </form>
            </main>
        </div>
    )
}