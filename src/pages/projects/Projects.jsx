import React from "react"
import { Link } from "react-router-dom"
import { getProjects } from "../../api"

export default function Projects() {
    const [projects, setProjects] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function loadProjects() {
            setLoading(true)
            try {
                const data = await getProjects()
                setProjects(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        loadProjects()
    }, [])

    const projectElements = projects.map(project => (
        <Link to={project.id} key={project.id}>
            <div className="yarn-tile">
                <div className="yarn-info">
                    <img src={project.image} />
                    <h3>{project.name ? project.name : "Untitled Project"}</h3>
                    <p>{project.status}</p>
                </div>
            </div>
        </Link>


    ))

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (error) {
        return <h1>There was an error: {error.message}</h1>
    }

    return (
        <div className="stash-container">
            <h1>Projects</h1>
            <p>{projectElements.length} projects total</p>

            <Link to="../addProject">Add project</Link>

            <div className="stash-list">
                {projectElements}
            </div>
        </div>
    )
}