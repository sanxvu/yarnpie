import { useState, useEffect } from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { getProject, deleteItem, getYarn } from "../../api"

export default function ProjectDetail() {
    const { projectId } = useParams()
    const [project, setProject] = useState(null)
    const [yarnDetails, setYarnDetails] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchProjectAndYarn() {
            setLoading(true)
            try {
                const data = await getProject(projectId)
                setProject(data)

                if (data.yarnUsed && Array.isArray(data.yarnUsed)) {
                    const yarnPromises = data.yarnUsed.map(yarnId => getYarn(yarnId));
                    const yarnInfo = await Promise.all(yarnPromises);
                    setYarnDetails(yarnInfo);
                }
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProjectAndYarn()
    }, [projectId])

    const handleDeleteProject = async () => {
        setLoading(true)
        try {
            await deleteItem("project", project.id, project.image.imagePublicId)
            navigate("/projects", { replace: true });
        }
        catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (error) {
        return <h1>There was an error: {error.message}</h1>
    }

    const search = location.state?.search || "";
    const type = location.state?.type || "all";

    return (
        <div className="yarn-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to {type} project</span></Link>

            {project && (
                <div className="yarn-detail">
                    <img src={project.image.imageUrl} />
                    <h3>{project.name}</h3>
                    <p>Status: {project.status}</p>

                    <p>Yarn used:</p>
                    {yarnDetails.length > 0 ? (
                        <ul>
                            {yarnDetails.map(yarn => (
                                <li key={yarn.id}>
                                    <Link to={`/stash/${yarn.id}`}>{yarn.name}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No yarn used for this project</p>
                    )}

                    <p>Amount Used: {project.amountUsed}<span> oz</span></p>
                    <p>Notes: {project.notes}</p>

                    <Link
                        to={`../editProject/${project.id}`}
                        state={{ from: location.pathname, projectFormData: project }}
                    >
                        <button>
                            Edit project
                        </button>
                    </Link>

                    <button onClick={() => handleDeleteProject()}>
                        Delete project
                    </button>

                </div>
            )}
        </div>
    )
}