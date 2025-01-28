import React from "react"
import { yarnCollection } from "../../api"
import { addDoc } from "firebase/firestore/lite"

export default function AddYarn() {
    const [yarnData, setYarnData] = React.useState(
        {
            name: "",
            color: "",
            material: "",
            weight: null,
            amountPerSkein: null,
            skeinAmount: null
        }
    )

    function handleChange(event) {
        const { name, value } = event.target
        setYarnData(prevYarnData => {
            return {
                ...prevYarnData,
                [name]: value
            }
        })
    }

    async function handleSubmit(event) {
        event.preventDefault() //prevent refresh and resetting inputs 

        const newYarn = {
            ...yarnData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        await addDoc(yarnCollection, newYarn)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                onChange={handleChange}
                name="name"
                value={yarnData.name}
            />
            <input
                type="text"
                placeholder="Color"
                onChange={handleChange}
                name="color"
                value={yarnData.color}
            />
            <input
                type="text"
                placeholder="Material"
                onChange={handleChange}
                name="material"
                value={yarnData.material}
            />
            <input
                type="text"
                placeholder="Weight"
                onChange={handleChange}
                name="weight"
                value={yarnData.weight}
            />
            <input
                type="number"
                placeholder="Amount per skein oz"
                onChange={handleChange}
                name="amountPerSkein"
                value={yarnData.amountPerSkein}
            />
            <input
                type="number"
                placeholder="Skein amount"
                onChange={handleChange}
                name="skeinAmount"
                value={yarnData.skeinAmount}
            />

            <br />
            <br />
            <button>Submit</button>
        </form>
    )
}