
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; 
import { 
  auth as firebaseAuthService,
  db as firebaseDbService,
  firestoreServerTimestamp, 
  onAuthStateChanged, 
  firebaseSignOut,
  type FirebaseUser,
  doc,
  getDoc,
  setDoc,
  ALLOWED_STUDENTS_COLLECTION,
  STUDENTS_COLLECTION,
  Timestamp, // Import Timestamp
  firebaseInitializationError
} from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import type { StudentProfile } from '@/types/user';

// Define types for AuthContext value
interface AuthContextValue {
  firebaseUser: FirebaseUser | null | undefined; 
  firebaseUid: string | null; 
  studentId: string | null; 
  studentProfile: StudentProfile | null;
  isLoading: boolean; 
  isAuthenticated: boolean; 
  login: (firebaseUser: FirebaseUser, studentId: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); 
	const { toast } = useToast();

  const isAuthenticated = !!firebaseUser && !!studentId;

  useEffect(() => {
    if (firebaseInitializationError) {
      toast({
        title: "Firebase Error",
        description: `Failed to initialize Firebase: ${firebaseInitializationError.message}. Authentication will not work.`,
        variant: "destructive",
        duration: 10000,
      });
      setIsLoading(false);
      setFirebaseUser(null);
      setFirebaseUid(null);
      setStudentId(null);
      setStudentProfile(null);
      return;
    }

    if (!firebaseAuthService || !firebaseDbService) {
      toast({
        title: "Firebase Not Ready",
        description: "Firebase services are not available. Please check configuration.",
        variant: "destructive",
        duration: 10000,
      });
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthService, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        setFirebaseUid(user.uid);
        
        const studentProfileDocRef = doc(firebaseDbService, STUDENTS_COLLECTION, user.uid);
        const studentProfileDocSnap = await getDoc(studentProfileDocRef);

        if (studentProfileDocSnap.exists()) {
          const profileData = studentProfileDocSnap.data() as StudentProfile;
          setStudentId(profileData.studentId);
          setStudentProfile(profileData);
          // Removed automatic redirection to prevent loops if already on login or other public pages.
          // Navigation should be handled by ProtectedRoute or page-specific logic.
        } else {
          // User is authenticated with Firebase, but no student profile means student ID step is pending
          setStudentId(null);
          setStudentProfile(null);
           if (pathname !== '/login') { // If not on login page, guide to login for student ID step.
            // router.push('/login'); // Commented out to prevent potential loops during initial load or if login page itself handles this state.
          }
        }
      } else {
        setFirebaseUser(null);
        setFirebaseUid(null);
        setStudentId(null);
        setStudentProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [pathname, router, toast]);

  const login = useCallback(async (loggedInFirebaseUser: FirebaseUser, studentIdInput: string) => {
    if (firebaseInitializationError || !firebaseAuthService || !firebaseDbService) {
      toast({ title: "Login Failed", description: "Firebase is not configured correctly.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setIsLoading(true); 

    try {
      const allowedStudentDocRef = doc(firebaseDbService, ALLOWED_STUDENTS_COLLECTION, studentIdInput);
      const allowedStudentDocSnap = await getDoc(allowedStudentDocRef);

      let allowedStudentInfo: { name?: string; email?: string } | null = null;

      if (allowedStudentDocSnap.exists()) {
        allowedStudentInfo = allowedStudentDocSnap.data() as { name?: string; email?: string };
      } else {
        // Allow student ID "8918" (and any other IDs that should bypass the allowed_students check for dev/testing)
        const bypassIds = ["8918", "8946", "8947", "STRITH23170"]; // Add other special case IDs here if needed
        if (bypassIds.includes(studentIdInput)) {
           toast({
            title: "Developer Note",
            description: `Student ID ${studentIdInput} is allowed for testing. Ensure it's in 'allowed_students' for production.`,
            variant: "default",
            duration: 7000,
          });
          // allowedStudentInfo remains null, name/email will be derived later.
        } else {
          // For other IDs, they must exist in allowed_students.
          toast({
            title: "Verification Failed",
            description: "Invalid student ID. This ID is not authorized for access.",
            variant: "destructive",
          });
          setIsLoading(false);
          return; 
        }
      }

      const studentProfileDocRef = doc(firebaseDbService, STUDENTS_COLLECTION, loggedInFirebaseUser.uid);
      const studentProfileDocSnap = await getDoc(studentProfileDocRef);
      
      const profileName = allowedStudentInfo?.name || loggedInFirebaseUser.displayName || `Student ${studentIdInput}`;
      const profileEmail = allowedStudentInfo?.email || loggedInFirebaseUser.email || `${studentIdInput}@example.com`;
      
      const newStudentProfileData: StudentProfile = {
        uid: loggedInFirebaseUser.uid,
        studentId: studentIdInput,
        name: profileName,
        email: profileEmail,
        coursesCompleted: studentProfileDocSnap.exists() ? (studentProfileDocSnap.data() as StudentProfile).coursesCompleted : [],
        quizzesAttempted: studentProfileDocSnap.exists() ? (studentProfileDocSnap.data() as StudentProfile).quizzesAttempted : [],
        // progress map removed, course progress is now in a subcollection
        lastLogin: firestoreServerTimestamp() as Timestamp,
        createdAt: studentProfileDocSnap.exists() ? (studentProfileDocSnap.data() as StudentProfile).createdAt : firestoreServerTimestamp() as Timestamp,
      };

      await setDoc(studentProfileDocRef, newStudentProfileData, { merge: true }); 

      setFirebaseUser(loggedInFirebaseUser); 
      setFirebaseUid(loggedInFirebaseUser.uid);
      setStudentId(studentIdInput);
      setStudentProfile(newStudentProfileData);
			
			toast({
				title: "Login Successful!",
				description: `Welcome, ${newStudentProfileData.name}!`,
			});
      router.push('/');

    } catch (error: any) {
      console.error("Student ID verification/profile creation error:", error);
      // Avoid showing duplicate "Verification Failed" if already handled
      const bypassIds = ["8918", "8946", "8947", "STRITH23170"];
      if (!(error.message.includes("Invalid student ID") && !bypassIds.includes(studentIdInput))) {
          toast({
              title: "Login Process Failed",
              description: `Something went wrong: ${error.message}`,
              variant: "destructive",
          });
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    if (firebaseInitializationError || !firebaseAuthService) {
      toast({ title: "Logout Failed", description: "Firebase is not configured correctly.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(firebaseAuthService); 
      setFirebaseUser(null);
      setFirebaseUid(null);
      setStudentId(null); 
      setStudentProfile(null);
			toast({
				title: "Logged Out",
				description: "You have been successfully logged out.",
			})
      router.push('/login'); 
    } catch (error) {
      console.error("Logout error:", error);
			toast({
				title: "Logout Failed",
				description: "Failed to log out. Please try again.",
				variant: "destructive",
			})
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const value: AuthContextValue = {
    firebaseUser,
    firebaseUid,
    studentId,
    studentProfile,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

