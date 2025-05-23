import { useContext, useState } from "react";
import { StashContext } from "../../contexts/StashContext";
import { Link } from "react-router-dom";
import yarnpie from "../../assets/yarnpie.jpg";
import "../projects/Projects.css";

export default function Stash() {
  const { yarnStash, error } = useContext(StashContext);
  const [sortOption, setSortOption] = useState("lastUpdated");

  const sortedYarn = [...yarnStash].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastUpdated":
        return b.updatedAt - a.updatedAt;
      default:
        return 0;
    }
  });

  const yarnElements = sortedYarn.map((yarn) => (
    <Link to={yarn.id} key={yarn.id}>
      <div className="yarn-tile">
        <div className="yarn-info">
          <img src={yarn.image.imageUrl ? yarn.iamge.imageUrl : yarnpie}></img>
          <h2>{yarn.name}</h2>
          <p>Remaining: {yarn.remainingAmount} oz</p>
        </div>
      </div>
    </Link>
  ));

  if (error) {
    return <h1>There was an error: {error.message}</h1>;
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="header-text">
          <h1 className="page-title">Your Yarn Stash</h1>
          <p className="page-subtitle">
            Keep track of all your yarn in one place.
          </p>
        </div>
        {/* <span>({yarnElements.length} yarn total)</span> */}

        <div className="header-actions">
          <div className="sort-dropdown">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="lastUpdated">Last Updated</option>
            </select>
          </div>

          <Link to="../addYarn">
            <button className="new-project-button">+ New Yarn</button>
          </Link>
        </div>
      </header>

      <section className="projects-grid">{yarnElements}</section>
    </div>
  );
}
