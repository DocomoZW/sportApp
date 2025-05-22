import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBPvQdgq9Z5gHsOkMqmteR3gzxsXe8GWp8",
  authDomain: "sportapp-467d3.firebaseapp.com",
  projectId: "sportapp-467d3",
  storageBucket: "sportapp-467d3.firebasestorage.app",
  messagingSenderId: "58373519597",
  appId: "1:58373519597:web:b38995a388a4eeeceef4e4",
  measurementId: "G-HGHS4PKKRW"
};

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApp();
} catch (e) {
  app = initializeApp(firebaseConfig);
}

const database: Database = getDatabase(app);

export { app, database };
