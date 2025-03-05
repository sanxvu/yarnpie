import React from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { getProject, deleteItem } from "../../api"

export default function ProjectDetail() {
    const [project, setProject] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    React.useEffect(() => {
        async function fetchProject() {
            setLoading(true)
            try {
                const data = await getProject(id)
                setProject(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [id])


    const handleDeleteProject = async () => {
        setLoading(true)
        try {
            await deleteItem("project", project.id, project.imagePublicId)
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
                    <h3>{project.name}</h3>
                    <p>Status: {project.status}</p>
                    <p>Yarn Used: {project.yarnUsed}</p>
                    <p>Amount Used: {project.amountUsed}<span> oz</span></p>
                    <p>Notes: {project.notes}</p>

                    <Link
                        to="../editProject"
                        state={{ from: location.pathname, projectId: project.id, formData: project }}
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