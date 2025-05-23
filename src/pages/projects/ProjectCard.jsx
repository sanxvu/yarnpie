import { Link } from "react-router-dom";
import yarnpie from "../../assets/yarnpie.jpg";
import "./Projects.css";

export default function ProjectCard({ project }) {
  return (
    <Link to={project.id} className="project-card">
      <div className="project-card-info">
        <img
          className="project-thumbnail"
          src={project.image.imageUrl || yarnpie}
          alt={project.name}
        />
        <div
          className={`status-pill ${project.status.toLowerCase().replace(" ", "-")}`}
        >
          {project.status}
        </div>
        <div className="project-info">
          <p className="project-name">{project.name}</p>
          <p className="project-updated">{project.updatedAt}</p>
        </div>
      </div>
    </Link>
  );
}
