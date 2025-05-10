
'use server';

import { db, firestoreServerTimestamp } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface StudentProgressFirestore {
  moduleName: string;
  completionStatus: string; // e.g., "Completed", "In Progress", "Not Started"
  score: number | null; // Score if applicable, null otherwise
  timestamp: any; // Using any for serverTimestamp() flexibility with Firestore
}

/**
 * Stores or updates a student's progress for a specific module in Cloud Firestore.
 *
 * @param studentId The unique identifier of the student.
 * @param moduleId The unique identifier of the module (will be used as the document ID).
 * @param moduleName The name of the learning module.
 * @param completionStatus The current completion status of the module.
 * @param score The score achieved in the module, if applicable.
 * @returns A promise that resolves when the progress is successfully saved.
 */
export async function storeStudentProgress(
  studentId: string,
  moduleId: string,
  moduleName: string,
  completionStatus: string,
  score: number | null
): Promise<void> {
  if (!studentId || !moduleId || !moduleName) {
    throw new Error('Student ID, Module ID, and Module Name are required to store progress.');
  }

  const progressDocRef = doc(db, `students/${studentId}/progress/${moduleId}`);
  
  const progressData: StudentProgressFirestore = {
    moduleName: moduleName,
    completionStatus: completionStatus,
    score: score,
    timestamp: firestoreServerTimestamp(),
  };

  try {
    await setDoc(progressDocRef, progressData);
    console.log(`Progress for student ${studentId} in module ${moduleName} (ID: ${moduleId}) saved successfully to Firestore.`);
  } catch (error) {
    console.error("Error saving student progress to Firestore:", error);
    throw new Error("Failed to save student progress.");
  }
}

// Example usage (can be called from a client component or another server action):
// storeStudentProgress("student_001", "module_1_js_intro", "Introduction to JS", "Completed", 95);
