import { useContext, useMemo, useState } from "react";
import { ProjectsContext } from "../../contexts/ProjectsContext";
import { Link } from "react-router-dom";
import ProjectCard from "./ProjectCard"; // import the new card component
import "./Projects.css";

export default function Projects() {
  const { projects, error } = useContext(ProjectsContext);
  const [sortBy, setSortBy] = useState("lastUpdated");

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastUpdated":
          return b.updatedAt - a.updatedAt;
        case "startDate":
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });
  }, [projects, sortBy]);

  if (error) {
    return <h1>Oops! Something went wrong: {error.message}</h1>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div className="header-text">
          <h1 className="page-title">Your Projects</h1>
          <p className="page-subtitle">
            Keep track of all your crochet projects in one place.
          </p>
        </div>

        <div className="header-actions">
          <div className="sort-dropdown">
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="name">Name</option>
              <option value="startDate">Start Date</option>
            </select>
          </div>

          <Link to="/addProject">
            <button className="new-project-button">+ New Project</button>
          </Link>
        </div>
      </div>

      <section className="projects-grid">
        {sortedProjects.length === 0 ? (
          <p className="no-projects-text">No projects found. Start by adding a new one!</p>
        ) : (
          sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </section>
    </div>
  );
}
