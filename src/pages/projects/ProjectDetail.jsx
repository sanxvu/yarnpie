import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { getProject, deleteItem, getYarn } from "../../api";
import yarnpie from "../../assets/yarnpie.jpg"

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [yarnDetails, setYarnDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjectAndYarn() {
      setLoading(true);
      try {
        const data = await getProject(projectId);
        setProject(data);

        // Fetch yarn details based on the project's yarnUsed yarnIds
        const yarns = await Promise.all(
          data.yarnUsed.map(async (item) => {
            try {
              const yarnData = await getYarn(item.yarnId);
              return {
                ...yarnData,
                amountUsed: item.amount,
              };
            } catch (error) {
              console.error(
                `Error fetching yarn with ID ${item.yarnId}:`,
                error
              );
              return {
                id: item.yarnId,
                name: "Missing Yarn", // Placeholder for missing yarn
                amountUsed: item.amount,
              };
            }
          })
        );
        setYarnDetails(yarns);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectAndYarn();
  }, [projectId]);

  const handleDeleteProject = async () => {
    setLoading(true);
    try {
      await deleteItem("project", project.id, project.image.imagePublicId);
      navigate("/projects", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }

  const search = location.state?.search || "";

  return (
    <div className="detail-container">
      <Link to={`..${search}`} relative="path" className="back-button">
        &larr; <span>Back to projects</span>
      </Link>

      {project && (
        <div className="detail">
          <img src={project.image.imageUrl ? project.image.imageUrl : yarnpie} />
          <h2>{project.name}</h2>
          <p>Status: {project.status}</p>
          <p>Last updated: {project.updatedAt}</p>
          <p>Created on: {project.createdAt}</p>
          <p>Yarn used: </p>
          <ul>
            {yarnDetails.length > 0 ? (
              yarnDetails.map((yarn) => (
                <li key={yarn.id}>
                  <Link to={`/stash/${yarn.id}`}>{yarn.name}</Link> - {yarn.amountUsed} oz used
                </li>
              ))
            ) : (
              <li>No yarn used for this project</li>
            )}
          </ul>
          <p>
            Amount Used: {project.amountUsed}
            <span> oz</span>
          </p>
          <p>Notes: {project.notes}</p>

          <Link
            to={`../editProject/${project.id}`}
            state={{ from: location.pathname, projectFormData: project }}
          >
            <button>Edit project</button>
          </Link>

          <button onClick={() => handleDeleteProject()}>Delete project</button>
        </div>
      )}
    </div>
  );
}
