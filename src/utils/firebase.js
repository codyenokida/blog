// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

require("dotenv").config();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.ENV_FIREBASE_API_KEY,
  authDomain: process.env.ENV_AUTH_DOMAIN,
  projectId: process.env.ENV_PROJECT_ID,
  storageBucket: process.env.ENV_STORAGE_BUCKET,
  messagingSenderId: process.env.ENV_MESSAGING_SENDER_ID,
  appId: process.env.ENV_APP_ID,
  measurementId: process.env.ENV_MEASUREMENT_ID,
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);
export const storage = getStorage(app);
