import { useContext, useState } from "react"
import { ProjectContext } from '../../contexts/ProjectContext';
import { Link } from "react-router-dom"

export default function Projects() {
    const { projects, loading, error } = useContext(ProjectContext)
    const [sortOption, setSortOption] = useState("lastUpdated");

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
                    <img src={project.image.imageUrl} />
                    <h3>{project.name}</h3>
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
            <div className="header-container">
                <Link to="../addProject">
                    <button className="header-add-button">
                        Add project
                    </button>
                </Link>
                <p>({projectElements.length} projects total)</p>

                <div className="filter-container">
                    Sort by: 
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="name">Name</option>
                        <option value="lastUpdated">Last Updated</option>
                        <option value="startDate">Start Date</option>
                    </select>
                </div>
            </div>

            <div className="stash-list">
                {projectElements}
            </div>
        </div>
    )
}