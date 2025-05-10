'use server';

import { db, STUDENTS_COLLECTION, firestoreServerTimestamp, getDoc, type FieldValue } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, type Timestamp } from 'firebase/firestore';
import type { StudentProfile, StudentProfileQuizAttempt } from '@/types/user';

/**
 * Adds a course to the student's list of completed courses in their profile.
 * @param userId The ID of the student (Firebase Auth UID).
 * @param courseId The ID of the course to add.
 */
export async function addCompletedCourseToProfile(userId: string, courseId: string): Promise<void> {
  if (!userId || !courseId) {
    throw new Error('User ID and Course ID are required.');
  }
  const studentDocRef = doc(db, STUDENTS_COLLECTION, userId);
  try {
    await updateDoc(studentDocRef, {
      coursesCompleted: arrayUnion(courseId)
    });
    console.log(`Course ${courseId} added to completed list for user ${userId}.`);
  } catch (error) {
    console.error('Error adding completed course to profile:', error);
    throw new Error('Failed to update completed courses in profile.');
  }
}

/**
 * Removes a course from the student's list of completed courses in their profile.
 * (Useful if a course completion needs to be undone)
 * @param userId The ID of the student (Firebase Auth UID).
 * @param courseId The ID of the course to remove.
 */
export async function removeCompletedCourseFromProfile(userId: string, courseId: string): Promise<void> {
  if (!userId || !courseId) {
    throw new Error('User ID and Course ID are required.');
  }
  const studentDocRef = doc(db, STUDENTS_COLLECTION, userId);
  try {
    await updateDoc(studentDocRef, {
      coursesCompleted: arrayRemove(courseId)
    });
    console.log(`Course ${courseId} removed from completed list for user ${userId}.`);
  } catch (error) {
    console.error('Error removing completed course from profile:', error);
    throw new Error('Failed to update completed courses in profile.');
  }
}

/**
 * Adds a quiz attempt to the student's profile.
 * @param userId The ID of the student (Firebase Auth UID).
 * @param quizAttemptData Object containing quizId, score, and attemptedAt (as Firestore Timestamp sentinel or resolved).
 */
export async function addQuizAttemptToProfile(
  userId: string,
  quizAttemptData: { quizId: string; score: number; attemptedAt: Timestamp | FieldValue }
): Promise<void> {
  if (!userId || !quizAttemptData.quizId) {
    throw new Error('User ID and Quiz ID are required for adding quiz attempt.');
  }
  if (quizAttemptData.attemptedAt === undefined) {
      throw new Error('AttemptedAt timestamp is required for quiz attempt.');
  }

  const studentDocRef = doc(db, STUDENTS_COLLECTION, userId);
  try {
    const studentSnap = await getDoc(studentDocRef);
    if (!studentSnap.exists()) {
      console.warn(`Student profile for user ${userId} not found. Cannot add quiz attempt. Consider creating profile first.`);
      // Depending on desired behavior, you might create a profile here or throw an error.
      // For now, we'll throw an error if the profile doesn't exist.
      throw new Error(`Student profile for user ${userId} not found.`);
    }

    const studentData = studentSnap.data() as StudentProfile;
    const existingAttempts = studentData.quizzesAttempted || [];

    // Create a StudentProfileQuizAttempt object.
    // The 'attemptedAt' field is a FieldValue (serverTimestamp) here.
    const newAttemptObject: StudentProfileQuizAttempt = {
      quizId: quizAttemptData.quizId,
      score: quizAttemptData.score,
      attemptedAt: quizAttemptData.attemptedAt as Timestamp, // Cast to Timestamp for the array type, Firestore handles FieldValue correctly
    };
    
    // If quizAttemptData.attemptedAt is FieldValue, we need to ensure the array update is type-safe
    // or cast appropriately for the update. Firestore handles FieldValue within an object in an array update.
    const newAttemptForUpdate = {
        quizId: quizAttemptData.quizId,
        score: quizAttemptData.score,
        attemptedAt: quizAttemptData.attemptedAt, // Pass as FieldValue or Timestamp
    };


    const updatedAttempts = [...existingAttempts, newAttemptForUpdate];

    await updateDoc(studentDocRef, {
      quizzesAttempted: updatedAttempts
    });
    console.log(`Quiz attempt for ${quizAttemptData.quizId} added to profile for user ${userId}.`);
  } catch (error) {
    console.error('Error adding quiz attempt to profile:', error);
    // Rethrow or handle as appropriate for your application
    throw new Error(`Failed to update quiz attempts in profile: ${(error as Error).message}`);
  }
}

