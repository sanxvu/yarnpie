import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    onSnapshot,
} from "firebase/firestore"

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const yarnCollection = collection(db, "yarn")
export const projectsCollection = collection(db, "projects")

// Get all projects (fetches once, no real-time updates)
export async function getProjects() {
    const snapshot = await getDocs(projectsCollection)
    const projects = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return projects
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
export async function getYarnStash() {
    const snapshot = await getDocs(yarnCollection)
    const stash = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return stash
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

import { Cloudinary } from "@cloudinary/url-gen";
const cld = new Cloudinary({
    cloud: {
        cloudName: import.meta.env.VITE_CLOUD_NAME
    }
});

/* cloudinary.config({
    cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
}) */

// Delete a yarn
export async function deleteYarn(yarnId, imagePublicId) {
    /* cld.v2.uploader.destroy(imagePublicId, function (error, result) {
        console.log(result, error)
    })
        .then(resp => console.log(resp))
        .catch(_err => console.log("Something went wrong, please try again later."));
 */
    const docRef = doc(db, "yarn", yarnId)
    await deleteDoc(docRef)

}