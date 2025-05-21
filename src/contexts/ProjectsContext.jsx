import { createContext, useState, useEffect } from "react";
import { getProjects } from "../api";
import { useAuth } from "./AuthContext";

export const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const unsubscribe = getProjects(currentUser, (updatedProjects) => {
          setProjects(updatedProjects);
        });
        return () => unsubscribe();
      } catch (err) {
        setError(err);
      } finally {
      }
    }

    loadProjects();
  }, [currentUser]);

  return (
    <ProjectsContext.Provider value={{ projects, setProjects, error }}>
      {children}
    </ProjectsContext.Provider>
  );
};
