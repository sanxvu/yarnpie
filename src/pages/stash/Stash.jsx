import React from "react"
import { Link } from "react-router-dom"
import { useContext } from 'react';
import { YarnContext } from '../../contexts/YarnContext';
import { useAuth } from "../../contexts/AuthContext"

export default function Stash() {
    const { yarnStash, loading, error } = useContext(YarnContext)
    const [sortOption, setSortOption] = React.useState("lastUpdated");
    
    const sortedYarn = [...yarnStash].sort((a, b) => {
        switch (sortOption) {
            case "name":
                return a.name.localeCompare(b.name)
            case "lastUpdated":
                return b.updatedAt - a.updatedAt
            default:
                return 0
        }
    })

    const yarnElements = sortedYarn.map(yarn => (
        <Link to={yarn.id} key={yarn.id}>
            <div className="yarn-tile">
                <div className="yarn-info">
                    <img src={yarn.image}></img>
                    <h3>{yarn.name}</h3>
                    <p>Available amount: {yarn.skeinAmount}<span> oz</span></p>
                </div>
            </div>
        </Link >
    ))

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (error) {
        return <h1>There was an error: {error.message}</h1>
    }

    return (
        <div className="stash-container">
            <h1>Stash</h1>
            <p>{yarnElements.length} yarn total</p>

            <Link to="../addYarn">
                <button>
                    Add yarn
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
            </select>
            
            <div className="stash-list">
                {yarnElements}
            </div>
        </div>
    )
}