import React from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import { getYarn } from "../../api"

export default function YarnDetail() {
    const [yarn, setYarn] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const { id } = useParams()
    const location = useLocation()

    React.useEffect(() => {
        async function loadYarn() {
            setLoading(true)
            try {
                const data = await getYarn(id)
                setYarn(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        loadYarn()
    }, [id])

    if (loading) {
        return <h1>Loading...</h1>
    }

    if (error) {
        return <h1>There was an error: {error.message}</h1>
    }

    const search = location.state?.search || "";
    const type = location.state?.type || "all";

    return (
        <div className="yarn-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to {type} yarn</span></Link>

            {yarn && (
                <div className="yarn-detail">
                    <h3>{yarn.name}</h3>
                    <p>Color: {yarn.color}</p>
                    <p>Material: {yarn.material}</p>
                    <p>Yarn Weight: {yarn.weight}</p>
                    <p>Amount per skein: {yarn.amountPerSkein}<span>oz</span></p>
                    <p>Skein amount: {yarn.skeinAmount}</p>
                </div>
            )}
        </div>
    )
}