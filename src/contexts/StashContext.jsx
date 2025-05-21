import { createContext, useState, useEffect } from "react";
import { getYarnStash, getProjects } from "../api";
import { useAuth } from "./AuthContext";

export const StashContext = createContext();

export const StashProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [yarnStash, setYarnStash] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setYarnStash([]);
      return;
    }

    let unsubscribeStash;
    let unsubscribeProjects;

    async function loadStashAndProjects() {
      try {
        unsubscribeStash = getYarnStash(currentUser, (updatedStash) => {
          setYarnStash(updatedStash);
        });

        unsubscribeProjects = await getProjects(
          currentUser,
          (updatedProjects) => {
            setProjects(updatedProjects);
          }
        );
      } catch (err) {
        setError(err);
      }
    }
    loadStashAndProjects();

    return () => {
      if (unsubscribeStash) unsubscribeStash();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [currentUser]);

  const calculatedStash = calculateYarnUsage(yarnStash, projects);

  return (
    <StashContext.Provider
      value={{ yarnStash: calculatedStash, setYarnStash, error }}
    >
      {children}
    </StashContext.Provider>
  );
};

// Helper function
function calculateYarnUsage(stash, projects) {
  console.log("Calculating yarn usage...");

  const usageMap = {};

  projects.forEach((project) => {
    project.yarnUsed?.forEach(({ yarnId, amount }) => {
      if (!usageMap[yarnId]) usageMap[yarnId] = 0;
      usageMap[yarnId] += amount;
      console.log(
        `Yarn ID: ${yarnId}, Amount: ${amount}, Total: ${usageMap[yarnId]}`
      );
    });
  });

  return stash.map((yarn) => {
    const used = usageMap[yarn.id] || 0;
    const amountPerSkein = yarn.amountPerSkein || 0;
    const skeinAmount = yarn.skeinAmount || 0;
    const total = amountPerSkein * skeinAmount;
    return {
      ...yarn,
      usedAmount: used,
      remainingAmount: total - used,
    };
  });
}
