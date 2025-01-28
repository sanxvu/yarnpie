import React from "react"
import { getProjects, getYarnStash } from "../../api"
import { Link } from "react-router-dom"

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
        <div key={project.id} className="yarn-tile">
            <Link
                to={project.id}
            >
                <div className="yarn-info">
                    <h3>{project.name}</h3>
                </div>
            </Link>
        </div>
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