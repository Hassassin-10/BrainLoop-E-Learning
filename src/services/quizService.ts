'use server';

import { db, firestoreServerTimestamp, type FieldValue } from '@/lib/firebase'; // Added FieldValue
import type { QuizQuestion, UserAnswer, QuizAttempt } from '@/types/quiz';
import { 
  collection, 
  addDoc, 
  type Timestamp 
} from 'firebase/firestore';
import { addQuizAttemptToProfile } from './studentProfileService'; 

/**
 * Submits a quiz attempt to Firestore.
 * Also updates the student's profile with the quiz attempt summary.
 * @param quizId The ID of the quiz.
 * @param quizTitle The title of the quiz.
 * @param userId The ID of the user who attempted the quiz (Firebase Auth UID).
 * @param answers An array of UserAnswer objects.
 * @param questions The full list of QuizQuestion objects for score calculation.
 * @param durationSeconds Optional duration of the quiz attempt in seconds.
 * @returns A Promise resolving to the ID of the submitted QuizAttempt document.
 */
export async function submitQuizAttempt(
  quizId: string,
  quizTitle: string,
  userId: string,
  answers: UserAnswer[],
  questions: QuizQuestion[],
  durationSeconds?: number,
): Promise<string> {
  try {
    let correctAnswersCount = 0;
    answers.forEach(userAnswer => {
      const question = questions.find(q => q.id === userAnswer.questionId);
      if (question && userAnswer.selectedOptionId === question.correctOptionId) {
        correctAnswersCount++;
      }
    });

    const score = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;
    const completedAtServerTimestamp: FieldValue = firestoreServerTimestamp(); 

    // Data for the student_quiz_attempts collection
    const attemptDataForWrite = {
      quizId,
      quizTitle,
      userId,
      answers,
      score: parseFloat(score.toFixed(2)), 
      totalQuestions: questions.length,
      completedAt: completedAtServerTimestamp, // Use FieldValue
      ...(durationSeconds && { durationSeconds }),
    };

    const attemptsCollectionRef = collection(db, 'student_quiz_attempts');
    const attemptDocRef = await addDoc(attemptsCollectionRef, attemptDataForWrite);
    
    // Data for updating the student's profile
    // addQuizAttemptToProfile expects `attemptedAt` as `Timestamp | FieldValue`
    await addQuizAttemptToProfile(userId, {
      quizId: quizId,
      score: parseFloat(score.toFixed(2)),
      attemptedAt: completedAtServerTimestamp, // Pass the FieldValue directly
    });

    return attemptDocRef.id;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw new Error('Failed to submit quiz attempt.');
  }
}

