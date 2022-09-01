import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM",
  authDomain: "gui-rovit.firebaseapp.com",
  projectId: "gui-rovit",
  storageBucket: "gui-rovit.appspot.com",
  messagingSenderId: "552636381201",
  appId: "1:552636381201:web:d9908117d1d4245dd799b0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app);
