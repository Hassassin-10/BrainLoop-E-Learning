
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
  getDocs, // Added getDocs
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc, // Added deleteDoc
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type FirestoreError,
  type FieldValue
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getDatabase, type Database, serverTimestamp as rtdbServerTimestamp, ref, set } from 'firebase/database';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'; // Added Messaging imports
import { v4 as uuidv4 } from 'uuid';

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
let messaging: Messaging | null = null; // Added messaging instance
let firebaseInitializationError: Error | null = null;

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Firebase API Key, Auth Domain, or Project ID is missing. Please check your environment variables (NEXT_PUBLIC_FIREBASE_...).");
  firebaseInitializationError = new Error("Firebase core configuration is missing. Firebase will not work.");
} else {
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
      if (firebaseConfig.databaseURL) {
         rtdb = getDatabase(app);
      }
      // Initialize Firebase Messaging
      if (typeof window !== 'undefined') { // Messaging is client-side only
        messaging = getMessaging(app);
      }
      // console.log("Firebase initialized.");
    } else {
      throw new Error("Firebase app could not be initialized.");
    }
  } catch (error: any) {
    console.error("Firebase initialization error:", error);
    firebaseInitializationError = error;
    app = null;
    auth = null;
    db = null;
    storage = null;
    rtdb = null;
    messaging = null;
  }
}


export {
  app,
  auth,
  db,
  storage,
  rtdb,
  messaging, // Export messaging
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
  getDocs,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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
  type FieldValue,
  uuidv4,
  getToken, // Export FCM getToken
  onMessage // Export FCM onMessage
};

// Firestore collection names
export const ALLOWED_STUDENTS_COLLECTION = 'allowed_students';
export const STUDENTS_COLLECTION = 'students';
export const FEEDBACK_COLLECTION = 'feedback';
export const STUDENT_QUIZ_ATTEMPTS_COLLECTION = 'student_quiz_attempts';
export const USERS_COLLECTION = 'users';
export const STUDENT_PROGRESS_COLLECTION = 'student_progress';
export const COURSES_COLLECTION_FS = 'courses';
