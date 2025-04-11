import { createContext, useState, useEffect } from "react";
import { getYarnStash, fetchProjects } from "../api";
import { useAuth } from "./AuthContext";

export const StashContext = createContext();

export const StashProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [yarnStash, setYarnStash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setYarnStash([]);
      return;
    }

    async function loadStashAndProjects() {
      setLoading(true);
      try {
        const unsubscribeStash = getYarnStash(
          currentUser,
          async (updatedStash) => {
            try {
              const projects = await fetchProjects(currentUser);
              const updatedStashWithUsage = calculateYarnUsage(
                updatedStash,
                projects,
              );
              setYarnStash(updatedStashWithUsage);
              setLoading(false);
            } catch (err) {
              setError(err);
              setLoading(false);
            }
          },
        );

        return () => unsubscribeStash();
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }

    loadStashAndProjects();
  }, [currentUser]);

  if (loading) return <p>Loading stash...</p>;

  return (
    <StashContext.Provider value={{ yarnStash, setYarnStash, loading, error }}>
      {children}
    </StashContext.Provider>
  );
};

// Helper function
function calculateYarnUsage(stash, projects) {
  const usageMap = {};

  projects.forEach((project) => {
    project.yarnUsed?.forEach(({ yarnId, amount }) => {
      if (!usageMap[yarnId]) usageMap[yarnId] = 0;
      usageMap[yarnId] += Number(amount);
    });
  });

  return stash.map((yarn) => {
    const used = usageMap[yarn.id] || 0;
    const total = Number(yarn.totalAmount || 0);
    return {
      ...yarn,
      usedAmount: used,
      remainingAmount: Math.max(0, total - used),
    };
  });
}
