// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDNqNvMSdpCnLbQn_TP2LUwAqmMwY5vSh0",
    authDomain: "inventory-management-app-42527.firebaseapp.com",
    projectId: "inventory-management-app-42527",
    storageBucket: "inventory-management-app-42527.appspot.com",
    messagingSenderId: "950015812275",
    appId: "1:950015812275:web:808f021d945371af7006c6",
    measurementId: "G-GR7JC4VDF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };
