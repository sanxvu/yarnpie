import { db } from "./firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import axios from "axios";

export const yarnCollection = collection(db, "yarn");
export const projectsCollection = collection(db, "projects");

// One-time fetch of projects - used in StashContext to calculate yarn usage
export async function fetchProjects(user) {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Real-time projects update
export async function getProjects(user, callback) {
  if (!user) {
    console.error("No user is logged in.");
    return;
  }

  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("userId", "==", user.uid));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(projects);
  });

  return unsubscribe;
}

// Real-time yarn stash update
export function getYarnStash(user, callback) {
  if (!user) {
    console.error("No user is logged in.");
    return;
  }

  const stashRef = collection(db, "yarn");
  const q = query(stashRef, where("userId", "==", user.uid));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const stash = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(stash);
  });

  return unsubscribe;
}

// Get a single project
export async function getProject(id) {
  const docRef = doc(db, "projects", id);
  const snapshot = await getDoc(docRef);
  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}
// Get a single yarn
export async function getYarn(id) {
  const docRef = doc(db, "yarn", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error("Yarn not found");
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

// Delete Yarn or Project and Image if included
export const deleteItem = async (itemType, itemId, imagePublicId) => {
  try {
    const response = await axios.delete(
      `http://localhost:8080/delete-${itemType}/${itemId}`,
      {
        data: imagePublicId ? { imagePublicId } : {},
      }
    );
    console.log("Yarn/project and image deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting yarn/project and image:", error);
    throw error;
  }
};

// Delete image 
export async function deleteImage(imagePublicId) {
  try {
    const response = await axios.delete("http://localhost:8080/delete-image/", {
      data: { imagePublicId: imagePublicId || null },
    });
    console.log("Image deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
