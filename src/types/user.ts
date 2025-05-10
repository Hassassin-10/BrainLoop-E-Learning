import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface AllowedStudent {
  name: string;
  email: string;
  // any other relevant fields for an allowed student
}

export interface StudentProfileQuizAttempt {
  quizId: string;
  score: number;
  attemptedAt: Timestamp | FieldValue; // Allow FieldValue for writing, will be Timestamp on read
}

export interface StudentProfile {
  uid: string; // Firebase Auth UID
  studentId: string;
  name: string;
  email: string;
  coursesCompleted: string[]; // Array of course IDs, for quick listing of completed courses
  quizzesAttempted: StudentProfileQuizAttempt[];
  lastLogin: Timestamp;
  createdAt: Timestamp;
}

// New type for the subcollection document students/{userId}/courses/{courseId}
export interface UserCourseProgress {
  completed: boolean;
  progress: number; // e.g., 0-100
  lastAccessed: Timestamp;
}

// Type for updating course progress. lastAccessed is handled by the service.
export type UserCourseProgressUpdate = Omit<UserCourseProgress, 'lastAccessed'>;

