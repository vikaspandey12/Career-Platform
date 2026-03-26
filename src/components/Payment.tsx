import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Smartphone, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

const Payment = ({ candidate, updateCandidate }: Props) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const amount = candidate.paidPlan === 'bundle' ? 99 : 49;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Mock Razorpay Order Creation
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, planId: candidate.paidPlan })
      });
      const order = await res.json();

      // Simulate Payment Gateway UI
      setTimeout(async () => {
        await updateCandidate({ isPaid: true });
        navigate('/success');
      }, 2000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
          <p className="text-gray-500 italic">Complete payment to unlock your career report.</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div className="space-y-1">
              <div className="font-bold text-gray-900">
                {candidate.paidPlan === 'bundle' ? 'Job Booster Pack' : 'Single Service'}
              </div>
              <div className="text-xs text-gray-500 italic">Instant Delivery via Email & WhatsApp</div>
            </div>
            <div className="text-2xl font-black text-gray-900">₹{amount}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">₹{amount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">GST (0%)</span>
              <span className="font-medium text-gray-900">₹0</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total Payable</span>
              <span className="text-blue-600">₹{amount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-800 transition-all flex items-center justify-center group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Pay with UPI / Card
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
              <Smartphone className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">UPI / GPay</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
              <CreditCard className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cards / Net</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium">Secure 256-bit SSL Encrypted Payment</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;
