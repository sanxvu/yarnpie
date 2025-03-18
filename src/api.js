import { db } from "./firebase/firebase"
import { collection, doc, getDoc, getDocs, deleteDoc, onSnapshot, query, where } from "firebase/firestore"
import axios from "axios"

export const yarnCollection = collection(db, "yarn")
export const projectsCollection = collection(db, "projects")

// Get all projects (fetches once, no real-time updates)
export async function getProjects(user) {
    if (!user) {
        console.log("No user signed in");
        return;
    }

    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,  
        ...doc.data()
    }));

    console.log(projects); 
    return projects;
}

// Get a single project
export async function getProject(id) {
    const docRef = doc(db, "projects", id)
    const snapshot = await getDoc(docRef)
    return {
        ...snapshot.data(),
        id: snapshot.id
    }
}

// Real-time listener for projects (auto updates state)
export function onProjectsUpdate(callback) {
    return onSnapshot(projectsCollection, snapshot => {
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(projects);
    });
}

// Delete a project
export async function deleteProject(projectId) {
    const docRef = doc(db, "projects", projectId)
    await deleteDoc(docRef)
}

// Get all yarn (fetches once, no real-time updates)
export async function getYarnStash(user) {
    if (!user) {
        console.log("No user signed in");
        return;
    }

    const stashRef = collection(db, "yarn");
    const q = query(stashRef, where("userId", "==", user.uid)); 

    const querySnapshot = await getDocs(q);
    const stash = querySnapshot.docs.map(doc => doc.data());
    return stash;
}

// Get a single yarn
export async function getYarn(id) {
    const docRef = doc(db, "yarn", id)
    const snapshot = await getDoc(docRef)
    return {
        ...snapshot.data(),
        id: snapshot.id
    }
}

// Real-time listener for yarn stash (auto updates state)
export function onYarnStashUpdate(callback) {
    return onSnapshot(yarnCollection, snapshot => {
        const stash = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(stash);
    });
}

// Delete Yarn or Project and Image if included
export const deleteItem = async (itemType, itemId, imagePublicId) => {
    try {
        const response = await axios.delete(`http://localhost:8080/delete-${itemType}/${itemId}`, {
            data: { imagePublicId: imagePublicId || null },
        });
        console.log("Yarn/project and image deleted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting yarn/project and image:", error);
        throw error;
    }
};