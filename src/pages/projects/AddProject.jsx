import React from "react"
import { projectsCollection } from "../../api"
import { addDoc } from "firebase/firestore/lite"
import { useContext } from 'react';
import { YarnContext } from '../stash/YarnContext';

export default function AddProject() {
    const [projectData, setProjectData] = React.useState(
        {
            name: ""
        }
    )

    const { yarnStash } = useContext(YarnContext)

    const yarnElements = yarnStash.map(yarn => (
        <option value={yarn.name}>{yarn.name}</option>
    ))

    function handleChange(event) {
        const { name, value } = event.target
        setProjectData(prevProjectData => {
            return {
                ...prevProjectData,
                [name]: value
            }
        })
    }

    async function handleSubmit(event) {
        event.preventDefault() //prevent refresh and resetting inputs 

        const newProject = {
            ...projectData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        await addDoc(projectsCollection, newProject)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                onChange={handleChange}
                name="name"
                value={projectData.name}
            />

            <fieldset>
                <legend>Status</legend>

                <input
                    type="radio"
                    id="workInProgress"
                    name="status"
                    value="workInProgress"
                    checked={projectData.status === "workInProgress"}
                    onChange={handleChange}
                />
                <label htmlFor="unemployed">Work in Progress</label>
                <br />

                <input
                    type="radio"
                    id="completed"
                    name="status"
                    value="completed"
                    checked={projectData.status === "completed"}
                    onChange={handleChange}
                />
                <label htmlFor="part-time">Completed</label>
                <br />

                <input
                    type="radio"
                    id="abandoned"
                    name="status"
                    value="abandoned"
                    checked={projectData.status === "abandoned"}
                    onChange={handleChange}
                />
                <label htmlFor="full-time">Abandoned</label>
                <br />

                <input
                    type="radio"
                    id="frogged"
                    name="status"
                    value="frogged"
                    checked={projectData.status === "frogged"}
                    onChange={handleChange}
                />
                <label htmlFor="full-time">Frogged</label>
                <br />
            </fieldset>
            <br />

            <label htmlFor="favColor">Select yarn: </label>
            <select
                id="yarnUsed"
                value={projectData.yarnUsed}
                onChange={handleChange}
                name="yarnUsed"
            >
                <option value="">-- Choose from stash--</option>
                {yarnElements}
            </select>

            <br />
            <br />

            <input
                type="number"
                placeholder="Amount used oz"
                onChange={handleChange}
                name="amountPerSkein"
                value={projectData.amountPerSkein}
            />

            <br />
            <br />

            <textarea
                value={projectData.notes}
                placeholder="Notes"
                onChange={handleChange}
                name="notes"
            />

            <br />
            <br />
            <button>Submit</button>
        </form>
    )
}