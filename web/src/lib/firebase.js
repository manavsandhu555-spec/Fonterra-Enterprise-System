import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBOBbXvKnreiXSXl7Y8vYNMjxgXQoqgM8k",
  authDomain: "fonterra-qa.firebaseapp.com",
  projectId: "fonterra-qa",
  storageBucket: "fonterra-qa.firebasestorage.app",
  messagingSenderId: "208717230471",
  appId: "1:208717230471:web:ec0ac1957653c873e7a322",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
