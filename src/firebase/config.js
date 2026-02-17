import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCf8UjRH_amifiCstPBzNmvX61OKlluaq8",
    authDomain: "youngartisan-2a7d9.firebaseapp.com",
    projectId: "youngartisan-2a7d9",
    storageBucket: "youngartisan-2a7d9.firebasestorage.app",
    messagingSenderId: "632633113903",
    appId: "1:632633113903:web:4fb6952bf34b8c977c75da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
