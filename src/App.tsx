import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Candidate } from './types';

// Components
import LandingPage from './components/LandingPage';
import ResumeUpload from './components/ResumeUpload';
import ProfileCompletion from './components/ProfileCompletion';
import OtpVerification from './components/OtpVerification';
import ServiceSelection from './components/ServiceSelection';
import Preview from './components/Preview';
import Payment from './components/Payment';
import PostPayment from './components/PostPayment';

const AppContent = () => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initCandidate = async () => {
      // Check if we have a saved candidate ID in localStorage
      let localId = localStorage.getItem('jobboost_candidate_id');
      if (!localId) {
        localId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('jobboost_candidate_id', localId);
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const docRef = doc(db, 'candidates', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Candidate;
            // If name is missing but available in firebaseUser, update it
            if (!data.fullName && firebaseUser.displayName) {
              const updated = { ...data, fullName: firebaseUser.displayName, email: firebaseUser.email || '' };
              await setDoc(docRef, updated);
              setCandidate(updated);
            } else {
              setCandidate(data);
            }
          } else {
            const newCandidate: Candidate = {
              uid: firebaseUser.uid,
              mobile: '',
              fullName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newCandidate);
            setCandidate(newCandidate);
          }
        } else {
          // If not logged in, try to load from local storage or initialize new
          const savedCandidate = localStorage.getItem('jobboost_candidate_data');
          if (savedCandidate) {
            setCandidate(JSON.parse(savedCandidate));
          } else {
            setCandidate({
              uid: localId!,
              mobile: '',
              email: '',
              fullName: '',
              createdAt: new Date().toISOString(),
            });
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    initCandidate();
  }, []);

  const updateCandidate = async (updates: Partial<Candidate>) => {
    if (!candidate) return;
    const updated = { ...candidate, ...updates };
    setCandidate(updated);
    
    // Save to local storage for persistence without auth
    localStorage.setItem('jobboost_candidate_data', JSON.stringify(updated));

    // Only sync to Firestore if the user is actually authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'candidates', auth.currentUser.uid), updated);
      } catch (error) {
        console.error("Firestore sync failed:", error);
      }
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    localStorage.removeItem('jobboost_candidate_data');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {candidate?.fullName && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {candidate.fullName.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Welcome, <span className="text-blue-600">{candidate.fullName}</span>
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </header>
      )}
      <div className={candidate?.fullName ? "pt-14" : ""}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<ResumeUpload updateCandidate={updateCandidate} />} />
          <Route path="/profile" element={<ProfileCompletion candidate={candidate!} updateCandidate={updateCandidate} />} />
          <Route path="/preview" element={<Preview candidate={candidate!} updateCandidate={updateCandidate} />} />
          <Route path="/services" element={<ServiceSelection candidate={candidate!} updateCandidate={updateCandidate} />} />
          <Route path="/report" element={<PostPayment candidate={candidate!} />} />
        </Routes>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
