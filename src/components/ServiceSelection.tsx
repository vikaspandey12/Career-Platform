import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Flame, ArrowRight, Sparkles, ShieldCheck, Zap, CreditCard, MessageCircle, Phone, IndianRupee, Briefcase } from 'lucide-react';
import { Candidate } from '../types';
import { toast } from 'sonner';

interface Props {
  candidate: Candidate;
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PlanId = 'resume' | 'market' | 'jobs' | 'bundle';

const ServiceSelection = ({ candidate, updateCandidate }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('bundle');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const plans: Record<PlanId, { id: PlanId; name: string; price: number; original: number; features: string[] }> = {
    resume: { id: 'resume', name: 'Make Resume (ATS)', price: 49, original: 199, features: ['AI Resume (ATS Optimized)', 'Professional Template'] },
    market: { id: 'market', name: 'My Market Value', price: 49, original: 199, features: ['Salary Analysis', 'Percentile Ranking'] },
    jobs: { id: 'jobs', name: 'Job Matches (Live)', price: 49, original: 199, features: ['Live Job Openings', 'Direct Apply Links'] },
    bundle: { id: 'bundle', name: 'Bundle Pack', price: 99, original: 597, features: ['Make Resume (ATS)', 'My Market Value (Salary Analysis)', 'Job Matches (Live)', 'Priority Support'] },
  };

  const handlePayment = async () => {
    setLoading(true);
    const plan = plans[selectedPlan];

    try {
      // 1. Create order on backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, currency: 'INR' }),
      });

      if (!response.ok) throw new Error('Failed to create order');
      const order = await response.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_yourkey',
        amount: order.amount,
        currency: order.currency,
        name: 'Spectrum HR',
        description: `Payment for ${plan.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            await updateCandidate({ paidPlan: selectedPlan, paymentStatus: 'paid' });
            toast.success('Payment successful! Generating your report...');
            navigate('/report');
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: candidate.fullName,
          email: candidate.email,
          contact: candidate.mobile,
        },
        theme: { color: '#000000' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 relative">
      {/* Contact Header */}
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <a 
          href="https://wa.me/919821555049" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all text-green-600 font-bold text-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>+91 9821555049</span>
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Select Your Plan</h2>
          <p className="text-gray-500 font-medium italic">Unlock your professional future today.</p>
        </div>

        <div className="space-y-6">
          {/* Bundle Plan */}
          <div
            onClick={() => setSelectedPlan('bundle')}
            className={`relative overflow-hidden p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer bg-white
              ${selectedPlan === 'bundle' ? 'border-blue-600 shadow-2xl scale-[1.02]' : 'border-transparent hover:border-gray-200'}`}
          >
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest flex items-center">
              <Flame className="w-3 h-3 mr-1 fill-white" />
              MOST POPULAR
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900">Bundle Pack</h3>
                  <p className="text-gray-500 text-sm font-medium">Complete career transformation.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-gray-900">₹99</div>
                  <div className="text-sm text-gray-400 line-through font-bold">₹597</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.bundle.features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3 text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full shrink-0">
                      <Check className="w-3 h-3 text-green-600 stroke-[3px]" />
                    </div>
                    <span className="text-xs font-bold">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-blue-600 font-black text-[10px] uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Save 83% with this bundle
                </span>
                {selectedPlan === 'bundle' && (
                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200">
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Single Services Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Single Services (₹49 each)</h3>
            <div className="grid grid-cols-1 gap-4">
              {(['resume', 'market', 'jobs'] as const).map((id) => (
                <div
                  key={id}
                  onClick={() => setSelectedPlan(id)}
                  className={`p-6 rounded-[2rem] border-4 transition-all cursor-pointer bg-white flex justify-between items-center
                    ${selectedPlan === id ? 'border-gray-900 shadow-xl scale-[1.01]' : 'border-transparent hover:border-gray-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {id === 'resume' && <Zap className="w-5 h-5" />}
                      {id === 'market' && <IndianRupee className="w-5 h-5" />}
                      {id === 'jobs' && <Briefcase className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-black text-gray-900">{plans[id].name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{plans[id].features[0]}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <div className="text-lg font-black text-gray-900">₹49</div>
                      <div className="text-[10px] text-gray-400 line-through font-bold">₹199</div>
                    </div>
                    {selectedPlan === id && (
                      <div className="bg-gray-900 text-white p-1.5 rounded-full">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Elements */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Verified</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instant Delivery</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Pay</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-5 bg-black text-white rounded-2xl font-black text-xl hover:bg-gray-800 transition-all flex items-center justify-center group shadow-2xl shadow-black/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ₹${plans[selectedPlan].price} & Get Report`}
          <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Trusted by 10,000+ Candidates in India
        </p>
      </motion.div>
    </div>
  );
};

export default ServiceSelection;
