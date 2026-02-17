// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWjDvL6joNFicGDyovR_o6hIbtwP6QUHk",
  authDomain: "hostel-companion-fe2b2.firebaseapp.com",
  projectId: "hostel-companion-fe2b2",
  storageBucket: "hostel-companion-fe2b2.firebasestorage.app",
  messagingSenderId: "707683687130",
  appId: "1:707683687130:web:5ba2d0e8d55a7f5ad663e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: "sastra.ac.in",
});