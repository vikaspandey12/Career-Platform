import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

const OtpVerification = ({ candidate, updateCandidate }: Props) => {
  const [mobile, setMobile] = useState(candidate.mobile || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      if (res.ok) {
        setStep('verify');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      if (res.ok) {
        await updateCandidate({ mobile });
        navigate('/services');
      } else {
        alert('Invalid OTP. Use 123456 for testing.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
            <Phone className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Mobile</h2>
          <p className="text-gray-500 italic">Mandatory for secure delivery of your report.</p>
        </div>

        {step === 'send' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-lg tracking-wider"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Enter 6-digit OTP</label>
              <input
                required
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-center text-2xl tracking-[1em] font-bold"
                placeholder="000000"
              />
              <p className="text-xs text-center text-gray-400">Sent to +91 {mobile}</p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Continue'}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400 uppercase tracking-widest">Or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await updateCandidate({ mobile });
                navigate('/services');
              }}
              className="w-full py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Skip Verification (MVP)
            </button>
            <button
              type="button"
              onClick={() => setStep('send')}
              className="w-full text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium">Your data is secured with 256-bit encryption</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerification;
