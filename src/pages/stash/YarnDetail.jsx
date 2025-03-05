import React from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { getYarn, deleteItem } from "../../api"

export default function YarnDetail() {
    const [yarn, setYarn] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    
    React.useEffect(() => {
        async function fetchYarn() {
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
        fetchYarn()
    }, [id])

    const handleDeleteYarn = async () => {
        setLoading(true)
        try {
            await deleteItem("yarn", yarn.id, yarn.imagePublicId)
            navigate("/stash", { replace: true });
        }
        catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

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
                    <img src={yarn.image} />
                    <h3>{yarn.name}</h3>
                    <p>Color: {yarn.color}</p>
                    <p>Material: {yarn.material}</p>
                    <p>Yarn Weight: {yarn.weight}</p>
                    <p>Amount per skein: {yarn.amountPerSkein}<span> oz</span></p>
                    <p>Skein Amount: {yarn.skeinAmount}<span> oz</span></p>
                    <p>Used in projects:</p>
                    <ul>
                        {yarn.usedInProjects && yarn.usedInProjects.length > 0 ? (
                            yarn.usedInProjects.map((projectId) => (
                                <li key={projectId}>
                                    <Link to={`/projects/${projectId}`}>{projectId}</Link>
                                </li>
                            ))
                        ) : (
                            <p>Not used in any projects</p>
                        )}
                    </ul>
                    <p>Amount available: {yarn.remainingAmount}<span> oz</span></p>

                    <Link
                        to="../editYarn"
                        state={{ from: location.pathname, yarnId: yarn.id, formData: yarn }}
                    >
                        <button>
                            Edit yarn
                        </button>
                    </Link>

                    <button onClick={() => handleDeleteYarn()}>
                        Delete yarn
                    </button>

                </div>
            )}
        </div>
    )
}