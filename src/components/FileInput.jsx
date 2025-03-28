import { useState, useEffect } from "react"

export default function FileInput({ selectedFile, preview, setSelectedFile, setPreview, imageRemoved, setImageRemoved }) {
    const [currentPreview, setCurrentPreview] = useState(preview);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    // Sync state with parent component's values
    useEffect(() => {
        setCurrentPreview(preview);
    }, [preview]);

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreview(null);
        }
    }

    function handleRemoveImage() {
        setSelectedFile(null)
        setPreview(null)
        setImageRemoved(true)
        //document.getElementById("fileInput").value = null;
    }

    return (
        <div>
            {/* File Input */}
            {!preview &&
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} />
            }

            {/* Preview current image */}
            {currentPreview && (
                <div>
                    <img src={currentPreview} alt="Current Yarn" style={{ width: "100px", marginTop: "10px" }} />
                    <button type="button" onClick={() => handleRemoveImage()}>Remove Image</button>
                </div>
            )}
        </div>
    )
}