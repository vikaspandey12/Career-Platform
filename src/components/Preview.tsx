import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Star, TrendingUp, Briefcase, ChevronRight, AlertCircle, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Candidate, JobMatch, SalaryInsight } from '../types';
import { generateSalaryInsight, matchJobs, calculateResumeScore } from '../services/geminiService';

interface Props {
  candidate: Candidate;
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

const Preview = ({ candidate, updateCandidate }: Props) => {
  const [salaryInsight, setSalaryInsight] = useState<SalaryInsight | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const [salary, jobMatches, score] = await Promise.all([
          generateSalaryInsight(candidate),
          matchJobs(candidate),
          calculateResumeScore(candidate)
        ]);
        setSalaryInsight(salary);
        setJobs(jobMatches);
        setScoreData(score);
        
        // Save score to candidate for later use in report
        await updateCandidate({
          marketPosition: score.marketPosition,
          scoreBreakdown: score.scoreBreakdown,
          improvementSuggestions: score.improvementSuggestions
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
  }, [candidate]);

  const getMissingFields = () => {
    const missing = [];
    if (!candidate.graduationDegree) missing.push("Graduation details");
    if (!candidate.tenthSchool) missing.push("10th details");
    if (!candidate.twelfthSchool) missing.push("12th details");
    if (!candidate.currentLocation) missing.push("Current location");
    if (!candidate.preferredLocation) missing.push("Preferred location");
    if (!candidate.roleDescription || candidate.roleDescription.length < 50) missing.push("Detailed job role");
    return missing;
  };

  const missingFields = getMissingFields();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-gray-900">Analyzing Your Profile</p>
          <p className="text-gray-500 font-medium italic animate-pulse">Calculating market value & job matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header Score Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-blue-200">
          <div className="space-y-2 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-black tracking-tight">Profile Analysis</h2>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">
                Market Position: {scoreData?.marketPosition || 'Calculating...'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
            <div className="text-6xl font-black leading-none">{scoreData?.score || 0}<span className="text-2xl font-normal opacity-60">/100</span></div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80">Resume Score</div>
          </div>
        </div>

        {/* Warnings for Missing Fields */}
        {missingFields.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex items-start space-x-4"
          >
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Improve Your Score!</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your score is lower because of missing information: <span className="font-bold">{missingFields.join(', ')}</span>. 
                Complete these for a better report.
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="text-xs font-bold text-amber-900 underline underline-offset-4 hover:text-amber-700 mt-2 block"
              >
                Go back to edit profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Score Breakdown */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {scoreData?.scoreBreakdown?.map((item: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>{item.category}</span>
                  <span>{item.points}/{item.maxPoints}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.points / item.maxPoints) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    className={`h-full rounded-full ${item.points / item.maxPoints > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Summary */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-gray-900 font-bold">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h3>Resume Summary</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 italic">
              "{candidate.roleDescription?.substring(0, 250)}..."
            </p>
            <div className="pt-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Key Highlights</div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills?.slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full font-bold uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Insight */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-gray-900 font-bold">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3>Market Value</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Range</div>
                <div className="text-3xl font-black text-gray-900 blur-[6px] select-none tracking-tight">
                  ₹ 12.5L - 18.2L
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center text-[10px] text-green-700 font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Market Alignment: High
                </div>
                <p className="text-[10px] text-green-600 mt-1 font-medium">Your profile matches top-tier salary brackets for {candidate.currentDesignation}.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Matches */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-900 font-bold">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3>Top Job Matches</h3>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-full">Preview Mode</span>
          </div>

          <div className="space-y-4">
            {jobs.slice(0, 2).map((job, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.role}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="blur-[4px] select-none mr-2">Confidential Company</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-blue-600">{job.matchScore}% Match</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">Unlock to Apply</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHECKOUT CTA */}
        <div className="bg-black text-white p-10 rounded-[3rem] space-y-8 text-center relative overflow-hidden shadow-2xl shadow-black/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="space-y-3 relative z-10">
            <h3 className="text-3xl font-black tracking-tight">Ready to Level Up?</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              Get your <span className="text-white font-bold">AI-Generated Resume</span>, full <span className="text-white font-bold">Market Report</span>, and direct <span className="text-white font-bold">Apply Links</span> to all matched jobs.
            </p>
          </div>
          
          <div className="relative z-10">
            <button
              onClick={() => navigate('/services')}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center group shadow-xl shadow-blue-600/30 active:scale-[0.98]"
            >
              CHECKOUT
              <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-gray-500 font-black uppercase tracking-widest relative z-10">
            <div className="flex items-center">
              <Lock className="w-3 h-3 mr-1.5 text-green-500" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Zap className="w-3 h-3 mr-1.5 text-yellow-500 fill-yellow-500" />
              Instant Report
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1.5 text-blue-500" />
              HR Verified
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Preview;
