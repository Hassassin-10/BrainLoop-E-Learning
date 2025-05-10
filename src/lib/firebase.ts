// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut, // Renamed to avoid conflict
  type User as FirebaseUser // Alias User to FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore, 
  serverTimestamp as firestoreServerTimestamp,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  type FirestoreError,
  type FieldValue // Added FieldValue export
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getDatabase, type Database, serverTimestamp as rtdbServerTimestamp, ref, set } from 'firebase/database';

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let rtdb: Database | null = null;
let firebaseInitializationError: Error | null = null;

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. Please check your environment variables (NEXT_PUBLIC_FIREBASE_API_KEY).");
  firebaseInitializationError = new Error("Firebase API Key is missing. Firebase will not work.");
} else if (typeof window !== 'undefined') { // Ensure Firebase initializes only on the client-side
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      rtdb = getDatabase(app);
      console.log("Firebase initialized successfully.");
    } else {
      throw new Error("Firebase app could not be initialized.");
    }
  } catch (error: any) {
    console.error("Firebase initialization error:", error);
    firebaseInitializationError = error;
    // Ensure these are null if initialization fails
    app = null;
    auth = null;
    db = null;
    storage = null;
    rtdb = null;
  }
} else {
  // For server-side, you might have a different initialization or skip client-side specific services
  // console.log("Firebase client-side initialization skipped on server.");
}


export { 
  app, 
  auth, 
  db, 
  storage, 
  rtdb, 
  rtdbServerTimestamp, 
  firestoreServerTimestamp,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  firebaseSignOut,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  onSnapshot,
  ref, 
  set,
  Timestamp, 
  type FirebaseUser,
  type FirestoreError, 
  firebaseInitializationError,
  type FieldValue // Export FieldValue
};

// Firestore collection names
export const ALLOWED_STUDENTS_COLLECTION = 'allowed_students';
export const STUDENTS_COLLECTION = 'students';
export const FEEDBACK_COLLECTION = 'feedback';
export const STUDENT_QUIZ_ATTEMPTS_COLLECTION = 'student_quiz_attempts';
export const USERS_COLLECTION = 'users'; 
export const STUDENT_PROGRESS_COLLECTION = 'student_progress'; 
export const COURSES_COLLECTION_FS = 'courses'; 

