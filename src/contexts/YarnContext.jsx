import React, { createContext, useState, useEffect } from 'react';
import { onYarnStashUpdate } from '../api';

export const YarnContext = createContext();

export const YarnProvider = ({ children }) => {
    const [yarnStash, setYarnStash] = React.useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = React.useState(null)

    useEffect(() => {
        // Listen for real-time updates
        const unsubscribe = onYarnStashUpdate(
            (updatedStash) => {
                setYarnStash(updatedStash);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
        
        return () => unsubscribe();
    }, []);

    return (
        <YarnContext.Provider value={{ yarnStash, setYarnStash, loading, error }}>
            {children}
        </YarnContext.Provider>
    );
};
