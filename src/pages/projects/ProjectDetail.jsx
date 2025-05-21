import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { getProject, deleteItem, getYarn } from "../../api";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import yarnpie from "../../assets/yarnpie.jpg";

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
    // Create warning message about yarn amounts being restored
    const yarnWarning = yarnDetails.length > 0
      ? `\n\nThis project uses the following yarns:\n${yarnDetails
          .map(yarn => `- ${yarn.name} (${yarn.amountUsed} oz)`)
          .join('\n')}\n\nDeleting this project will restore these amounts back to your yarn stash.`
      : "";

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this project? This action cannot be undone.${yarnWarning}`
    );
    if (!confirmDelete) return;

    setLoading(true);

    try {
      // First update all affected yarns to remove this project and restore amounts
      await Promise.all(yarnDetails.map(async (yarn) => {
        // Remove this project from the yarn's usedInProjects array
        const updatedUsedInProjects = yarn.usedInProjects.filter(
          project => project.projectId !== projectId
        );

        // Update the yarn document - fixed collection name from "yarns" to "yarn"
        await updateDoc(doc(db, "yarn", yarn.id), {
          usedInProjects: updatedUsedInProjects
        });
      }));

      // Then delete the project
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
          <img
            src={project.image.imageUrl ? project.image.imageUrl : yarnpie}
          />
          <h2>{project.name}</h2>
          <p>Status: {project.status}</p>
          <p>Last updated: {project.updatedAt}</p>
          <p>Created on: {project.createdAt}</p>
          <p>Yarn used: </p>
          <ul>
            {yarnDetails.length > 0 ? (
              yarnDetails.map((yarn) => (
                <li key={yarn.id}>
                  <Link to={`/stash/${yarn.id}`}>{yarn.name}</Link> -{" "}
                  {yarn.amountUsed} oz used
                </li>
              ))
            ) : (
              <li>No yarn used for this project</li>
            )}
          </ul>
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
