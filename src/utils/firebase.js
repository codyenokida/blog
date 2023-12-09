// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADbkWgT9sf363Mk5hn8jFuKnEhL8YaygQ",
  authDomain: "kota-blog-efceb.firebaseapp.com",
  projectId: "kota-blog-efceb",
  storageBucket: "kota-blog-efceb.appspot.com",
  messagingSenderId: "511806902822",
  appId: "1:511806902822:web:96ff45cf59e27d667c8ce7",
  measurementId: "G-8V58VSF47W"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);
export const storage = getStorage(app);

