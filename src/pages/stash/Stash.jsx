import { useContext, useState } from "react";
import { StashContext } from "../../contexts/StashContext";
import { Link } from "react-router-dom";
import yarnpie from "../../assets/yarnpie.jpg";

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
    <div className="stash-container">
      <div className="header-container">
        <h1>Stash</h1>
        <h4>({yarnElements.length} yarn total)</h4>
        <div className="filter-container">
          <select
            className="projects-filter"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="lastUpdated">Last Updated</option>
          </select>
        </div>
      </div>

      <Link to="../addYarn">
        <button className="header-add-button">+ Add yarn</button>
      </Link>

      <div className="stash-list">{yarnElements}</div>
    </div>
  );
}
