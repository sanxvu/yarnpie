import React from "react"
import { Link } from "react-router-dom"
import { useContext } from 'react';
import { YarnContext } from './YarnContext';

export default function Stash() {
    const { yarnStash, loading, error } = useContext(YarnContext)

    const yarnElements = yarnStash.map(yarn => (
        <Link to={yarn.id}>
            <div key={yarn.id} className="yarn-tile">
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

            <Link to="../addYarn">Add yarn</Link>

            <div className="stash-list">
                {yarnElements}
            </div>
        </div>
    )
}