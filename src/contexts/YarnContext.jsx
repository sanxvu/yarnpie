import { createContext, useState, useEffect } from 'react';
import { getYarnStash } from '../api';
import { useAuth } from "./AuthContext"

export const YarnContext = createContext();

export const YarnProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [yarnStash, setYarnStash] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setYarnStash([]);
            return;
        }

        async function loadStash() {
            setLoading(true)
            try {
                const unsubscribe = getYarnStash(currentUser,
                    (updatedStash) => {
                        setYarnStash(updatedStash);
                        setLoading(false);
                    });

                return () => unsubscribe();
            }
            catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        loadStash()
    }, [currentUser]);

    if (loading) return <p>Loading stash...</p>;

    return (
        <YarnContext.Provider value={{ yarnStash, setYarnStash, loading, error }}>
            {children}
        </YarnContext.Provider>
    );
};
