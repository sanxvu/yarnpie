import { createContext, useState, useEffect } from 'react';
import { getProjects } from '../api';
import { useAuth } from "./AuthContext"

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadProjects() {
            setLoading(true)
            try {
                const unsubscribe = getProjects(currentUser,
                    (updatedProjects) => {
                        setProjects(updatedProjects);
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

        loadProjects()
    }, [currentUser]);

    if (loading) return <p>Loading projects...</p>;

    return (
        <ProjectContext.Provider value={{ projects, setProjects, loading, error }}>
            {children}
        </ProjectContext.Provider>
    );
};
