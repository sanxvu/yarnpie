import React, { createContext, useState, useEffect } from 'react';
import { getYarnStash } from '../../api';

export const YarnContext = createContext();

export const YarnProvider = ({ children }) => {
    const [yarnStash, setYarnStash] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        async function fetchYarnData() {
            setLoading(true)
            try {
                const data = await getYarnStash()
                setYarnStash(data)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchYarnData()
    }, [])

    return (
        <YarnContext.Provider value={{ yarnStash, setYarnStash, loading, error }}>
            {children}
        </YarnContext.Provider>
    );
};
