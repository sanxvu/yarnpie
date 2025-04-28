import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { getYarn, getProject, deleteItem } from "../../api";
import yarnpie from "../../assets/yarnpie.jpg"

export default function YarnDetail() {
  const { yarnId } = useParams();
  const [yarn, setYarn] = useState(null);
  const [projectDetails, setProjectDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchYarnAndProject() {
      setLoading(true);
      try {
        const data = await getYarn(yarnId);
        setYarn(data);

        // Fetch yarn details based on the project's yarnUsed yarnIds
        const projects = await Promise.all(
          data.usedInProjects.map(async (item) => {
            const projectData = await getProject(item.projectId);
            return {
              ...projectData,
              amountUsed: item.amount, // Bring in the amount used from project
            };
          }),
        );
        setProjectDetails(projects);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchYarnAndProject();
  }, [yarnId]);

  const handleDeleteYarn = async () => {
    setLoading(true);
    try {
      await deleteItem("yarn", yarn.id, yarn.image.imagePublicId);
      navigate("/stash", { replace: true });
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
  //const type = location.state?.type || "all";

  return (
    <div className="detail-container">
      <Link to={`..${search}`} relative="path" className="back-button">
        &larr; <span>Back to Stash</span>
      </Link>

      {yarn && (
        <div className="detail">
          <img src={yarn.image.imageUrl ? yarn.image.imageUrl : yarnpie} />
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
          {yarn.usedInProjects && yarn.usedInProjects.length > 0 ? (
            <ul>
              {projectDetails.map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`}>{project.name}</Link> –{" "}
                  {project.amountUsed} oz used
                </li>
              ))}
            </ul>
          ) : (
            <li>No projects using ths yarn.</li>
          )}
          <p>
            Amount available: {yarn.remainingAmount}
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
