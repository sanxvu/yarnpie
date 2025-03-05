import React from "react"
import { Link } from "react-router-dom"
import { getProjects } from "../../api"

export default function Projects() {
    const [projects, setProjects] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [sortOption, setSortOption] = React.useState("lastUpdated");

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

    const sortedProjects = [...projects].sort((a, b) => {
        switch (sortOption) {
            case "name":
                return a.name.localeCompare(b.name)
            case "lastUpdated":
                return b.updatedAt - a.updatedAt
            case "startDate":
                return b.createdAt - a.createdAt
            default:
                return 0
        }
    })

    const projectElements = sortedProjects.map(project => (
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

            <Link to="../addProject">
                <button>
                    Add project
                </button>
            </Link>
            
            <br /> <br />

            Sort by:
            <select
                className="projects-filter"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="name">Name</option>
                <option value="lastUpdated">Last Updated</option>
                <option value="startDate">Start Date</option>
            </select>

            <div className="stash-list">
                {projectElements}
            </div>
        </div>
    )
}