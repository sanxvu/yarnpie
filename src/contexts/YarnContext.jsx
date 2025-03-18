import React, { createContext, useState, useEffect } from 'react';
import { onYarnStashUpdate } from '../api';
import { getYarnStash } from '../api';
import { useAuth } from "./AuthContext"

export const YarnContext = createContext();

export const YarnProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [yarnStash, setYarnStash] = React.useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = React.useState(null)

    useEffect(() => {
        async function loadStash() {
            setLoading(true)
            try {
                const data = await getYarnStash(currentUser)
                setYarnStash(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        loadStash()
        // Listen for real-time updates
        /* const unsubscribe = onYarnStashUpdate(
            (updatedStash) => {
                setYarnStash(updatedStash);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        
        return () => unsubscribe(); */
    }, []);

    return (
        <YarnContext.Provider value={{ yarnStash, setYarnStash, loading, error }}>
            {children}
        </YarnContext.Provider>
    );
};
