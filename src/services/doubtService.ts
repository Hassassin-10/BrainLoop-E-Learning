'use client'; // This service will be called from client components

import {
  db,
  firestoreServerTimestamp, // Keep for main doubt message if needed elsewhere
  Timestamp, // Import Timestamp
  type FieldValue 
} from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore';
import type { DoubtMessage, DoubtReply } from '@/types/doubt';

const COURSES_COLLECTION = 'courses';
const MODULES_SUBCOLLECTION = 'modules';
const DOUBTS_SUBCOLLECTION = 'doubts';

// Function to listen for doubts for a specific module
export function getDoubtsForModule(
  courseId: string,
  moduleId: string,
  callback: (doubts: DoubtMessage[]) => void,
  onError: (error: FirestoreError) => void
): () => void { // Returns an unsubscribe function
  if (!courseId || !moduleId) {
    console.error("Course ID and Module ID are required to fetch doubts.");
    onError({ code: 'invalid-argument', message: 'Course ID and Module ID are required.' } as FirestoreError);
    return () => {};
  }
  const doubtsCollectionRef = collection(
    db,
    COURSES_COLLECTION,
    courseId,
    MODULES_SUBCOLLECTION,
    moduleId,
    DOUBTS_SUBCOLLECTION
  );
  const q = query(doubtsCollectionRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const doubts: DoubtMessage[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      
      const repliesFromDb = (data.replies || []) as Array<DocumentData & { timestamp?: Timestamp | FieldValue }>;

      const processedReplies: DoubtReply[] = repliesFromDb.map((replyData, index: number) => {
        let ts: Timestamp;
        if (replyData.timestamp instanceof Timestamp) {
          ts = replyData.timestamp;
        } else if (replyData.timestamp && typeof (replyData.timestamp as any).toDate === 'function') {
          // Handling cases where it might be a Firestore-like object but not strictly Timestamp instance on client initially
          ts = (replyData.timestamp as any).toDate(); 
           if (!(ts instanceof Date)) ts = new Timestamp(0,0); // ensure it's a Date before making a Timestamp
           else ts = Timestamp.fromDate(ts);
        } else {
          ts = new Timestamp(0,0); // Fallback for safety
        }


        return {
          id: replyData.id || `${docSnap.id}-reply-${Date.now()}-${index}`,
          text: replyData.text || '',
          senderId: replyData.senderId || '',
          senderName: replyData.senderName || replyData.senderId || '',
          timestamp: ts, 
        };
      }).sort((a, b) => {
        return (a.timestamp as Timestamp).toMillis() - (b.timestamp as Timestamp).toMillis();
      });

      doubts.push({
        id: docSnap.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName || data.senderId,
        timestamp: data.timestamp as Timestamp, 
        pinned: data.pinned || false,
        replies: processedReplies,
        moduleId: data.moduleId || moduleId,
        courseId: data.courseId || courseId,
      });
    });
    callback(doubts);
  }, (error) => {
    console.error("Error fetching doubts in real-time: ", error);
    onError(error);
  });

  return unsubscribe;
}

// Function to add a new doubt
export async function addDoubt(
  courseId: string,
  moduleId: string,
  doubtText: string,
  senderId: string,
  senderName: string
): Promise<string> {
  if (!courseId || !moduleId || !doubtText.trim() || !senderId) {
    throw new Error('Course ID, Module ID, doubt text, and sender ID are required.');
  }
  const doubtData: Omit<DoubtMessage, 'id' | 'timestamp'> & { timestamp: FieldValue } = { 
    text: doubtText,
    senderId: senderId,
    senderName: senderName || senderId,
    timestamp: firestoreServerTimestamp(), 
    pinned: false,
    replies: [],
    moduleId: moduleId,
    courseId: courseId,
  };
  const doubtsCollectionRef = collection(
    db,
    COURSES_COLLECTION,
    courseId,
    MODULES_SUBCOLLECTION,
    moduleId,
    DOUBTS_SUBCOLLECTION
  );
  const docRef = await addDoc(doubtsCollectionRef, doubtData);
  return docRef.id;
}

// Function to add a reply to a doubt
export async function addReplyToDoubt(
  courseId: string,
  moduleId: string,
  doubtId: string,
  replyText: string,
  senderId: string,
  senderName: string
): Promise<void> {
  if (!courseId || !moduleId || !doubtId || !replyText.trim() || !senderId) {
    throw new Error('Required fields missing for adding reply.');
  }

  const doubtDocRef = doc(
    db,
    COURSES_COLLECTION,
    courseId,
    MODULES_SUBCOLLECTION,
    moduleId,
    DOUBTS_SUBCOLLECTION,
    doubtId
  );

  try {
    const docSnap = await getDoc(doubtDocRef);
    if (!docSnap.exists()) {
      throw new Error('Doubt document not found.');
    }
    const doubtData = docSnap.data();
    // Ensure existing replies' timestamps are Firestore Timestamp objects
    const existingReplies: DoubtReply[] = (doubtData?.replies || []).map((reply: any) => {
        let ts: Timestamp;
        if (reply.timestamp instanceof Timestamp) {
            ts = reply.timestamp;
        } else if (reply.timestamp && typeof (reply.timestamp as any).toDate === 'function') {
             // Convert plain JS Date or other Firestore-like timestamp objects to Firestore Timestamp
            const date = (reply.timestamp as any).toDate();
            ts = Timestamp.fromDate(date instanceof Date ? date : new Date(0));
        } else {
            ts = new Timestamp(0,0); // Fallback for malformed data
        }
        return {
            ...reply,
            timestamp: ts,
        };
    });
    
    const newReply: DoubtReply = { 
      id: `${doubtId}-reply-${Date.now()}-${existingReplies.length}`,
      text: replyText,
      senderId: senderId,
      senderName: senderName || senderId,
      timestamp: Timestamp.now(), // Use client-side Firestore Timestamp
    };

    const updatedReplies = [...existingReplies, newReply];

    // Sort replies by timestamp before saving to maintain chronological order
    updatedReplies.sort((a, b) => {
      const tsA = a.timestamp as Timestamp; // All elements should be Timestamp now
      const tsB = b.timestamp as Timestamp;
      return tsA.toMillis() - tsB.toMillis();
    });

    await updateDoc(doubtDocRef, {
      replies: updatedReplies,
    });
  } catch (error: any) {
    console.error('Error adding reply to doubt:', error);
    let message = 'Failed to post reply.';
    if (error.message) {
      message += ` Details: ${error.message}`;
    }
    throw new Error(message);
  }
}

// Function to toggle the pinned status of a doubt
export async function togglePinDoubt(
  courseId: string,
  moduleId: string,
  doubtId: string,
  currentPinnedStatus: boolean,
  currentUserId: string
): Promise<void> {
  if (!courseId || !moduleId || !doubtId || !currentUserId) {
    throw new Error('Required fields missing for pinning doubt.');
  }
  const doubtDocRef = doc(
    db,
    COURSES_COLLECTION,
    courseId,
    MODULES_SUBCOLLECTION,
    moduleId,
    DOUBTS_SUBCOLLECTION,
    doubtId
  );

  const doubtSnap = await getDoc(doubtDocRef);
  if (doubtSnap.exists()) {
    const doubtData = doubtSnap.data() as DoubtMessage; 
    if (doubtData.senderId === currentUserId) {
      await updateDoc(doubtDocRef, {
        pinned: !currentPinnedStatus,
      });
    } else {
      throw new Error("You can only pin/unpin your own doubts.");
    }
  } else {
    throw new Error("Doubt not found.");
  }
}
