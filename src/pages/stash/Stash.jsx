import React from "react"
import { Link } from "react-router-dom"
import { useContext } from 'react';
import { YarnContext } from './YarnContext';

export default function Stash() {
    const { yarnStash, loading, error } = useContext(YarnContext)

    const yarnElements = yarnStash.map(yarn => (
        <div key={yarn.id} className="yarn-tile">
            <Link
                to={yarn.id}
            >
                <div className="yarn-info">
                    <h3>{yarn.name}</h3>
                    <p>Color: {yarn.color}</p>
                    <p>Material: {yarn.material}</p>
                    <p>Yarn Weight: {yarn.weight}</p>
                    <p>Amount per skein: {yarn.amountPerSkein}<span>oz</span></p>
                    <p>Skein amount: {yarn.skeinAmount}</p>
                </div>
            </Link>
        </div>
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