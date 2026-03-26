import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google! Your progress will be synced.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in with Google.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-white">
      <div className="absolute top-6 right-6">
        <button
          onClick={handleGoogleSignIn}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
        >
          Sign In
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
          <Zap className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
          Trusted by 50,000+ Indian Candidates
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Get Resume + Salary Check + 3 Job Matches in <span className="text-blue-600">10 Minutes</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          Starting at just <span className="font-bold text-gray-900">₹49</span>. 
          The only platform built for the Indian job market.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all flex items-center justify-center group"
          >
            Upload Resume & Start
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black border-2 border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all"
          >
            Fill Details Manually
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100">
          {[
            "ATS-Friendly Resume",
            "Market Value Check",
            "Verified Job Matches"
          ].map((feature, i) => (
            <div key={i} className="flex items-center justify-center space-x-2 text-gray-500">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* QR Code Section for Testing */}
        <div className="pt-12 flex flex-col items-center space-y-4">
          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm inline-block">
            {/* Replace the src below with your actual QR code image URL */}
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ais-pre-7uwqwhaxqlboo3jzpnjcxi-750143554759.asia-southeast1.run.app" 
              alt="Scan to Test"
              className="w-32 h-32"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Scan to test on mobile or share with friends
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
