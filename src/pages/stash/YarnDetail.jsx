import { useState, useContext, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { StashContext } from "../../contexts/StashContext";
import { ProjectsContext } from "../../contexts/ProjectsContext";
import { deleteItem } from "../../api";
import yarnpie from "../../assets/yarnpie.jpg";

export default function YarnDetail() {
  const { yarnId } = useParams();
  const { projects } = useContext(ProjectsContext);
  const { yarnStash, error } = useContext(StashContext);
  const [projectDetails, setProjectDetails] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const yarn = yarnStash.find((y) => y.id === yarnId);

  // Fetch project details to display project names where yarn is used
  useEffect(() => {
    async function fetchProjectDetails() {
      if (yarn && yarn.usedInProjects && yarn.usedInProjects.length > 0) {
        try {
          // Map through the usedInProjects array to get project details
          const projectsData = yarn.usedInProjects.map((item) => {
            const projectData = projects.find((p) => p.id === item.projectId);
            return projectData
              ? {
                  ...projectData,
                  amountUsed: item.amount,
                }
              : {
                  id: item.projectId,
                  name: "Deleted Project",
                  amountUsed: item.amount,
                };
          });
          setProjectDetails(projectsData);
        } catch (err) {
          console.error("Error fetching project details:", err);
        }
      } else {
        setProjectDetails([]); // Reset project details if no projects are using this yarn
      }
    }
    fetchProjectDetails();
  }, [yarn, projects]);

  const handleDeleteYarn = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this yarn? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteItem("yarn", yarn.id, yarn.image.imagePublicId);
      navigate("/stash", { replace: true });
    } catch (err) {
      console.error("Error deleting yarn:", err);
    } finally {
    }
  };

  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }

  const search = location.state?.search || "";
  //const type = location.state?.type || "all";

  return (
    <div className="detail-container">
      <Link to={`..${search}`} relative="path" className="back-button">
        &larr; <span>Back to Stash</span>
      </Link>

      {yarn && (
        <div className="detail">
          <img src={yarn.image?.imageUrl ? yarn.image.imageUrl : yarnpie} />
          <h3>{yarn.name}</h3>
          <p>Color: {yarn.color}</p>
          <p>Material: {yarn.material}</p>
          <p>Yarn Weight: {yarn.weight}</p>
          <p>
            Amount per skein: {yarn.amountPerSkein}
            <span> oz</span>
          </p>
          <p>
            Skein Amount: {yarn.skeinAmount}
            <span> oz</span>
          </p>
          <p>Used in projects:</p>
          <ul>
            {yarn.usedInProjects && yarn.usedInProjects.length > 0 ? (
              projectDetails.map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`}>{project.name}</Link> –{" "}
                  {project.amountUsed} oz used
                </li>
              ))
            ) : (
              <li>No projects using this yarn.</li>
            )}
          </ul>
          <p>
            Remaining Amount: {yarn.remainingAmount}
            <span> oz</span>
          </p>

          <Link
            to={`../editYarn/${yarnId}`}
            state={{
              from: location.pathname,
              yarnFormData: yarn,
            }}
          >
            <button>Edit yarn</button>
          </Link>

          <button onClick={() => handleDeleteYarn()}>Delete yarn</button>
        </div>
      )}
    </div>
  );
}
