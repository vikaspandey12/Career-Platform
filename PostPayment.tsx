import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Mail, MessageCircle, CheckCircle, FileText, TrendingUp, Briefcase, Loader2, Star, Target, Award, ExternalLink, Share2 } from 'lucide-react';
import { Candidate, JobMatch, SalaryInsight, ResumeScore } from '../types';
import { generateSalaryInsight, matchJobs, calculateResumeScore } from '../services/geminiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface Props {
  candidate: Candidate;
}

const PostPayment = ({ candidate }: Props) => {
  const [loading, setLoading] = useState(true);
  const [salaryInsight, setSalaryInsight] = useState<SalaryInsight | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [score, setScore] = useState<ResumeScore | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salary, jobMatches, resumeScore] = await Promise.all([
          generateSalaryInsight(candidate),
          matchJobs(candidate),
          calculateResumeScore(candidate)
        ]);
        setSalaryInsight(salary);
        setJobs(jobMatches);
        setScore(resumeScore);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load some report data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [candidate]);

  const downloadResume = async () => {
    const element = document.getElementById('resume-content');
    if (!element) return;
    try {
      toast.loading('Preparing your PDF...');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${candidate.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`);
      toast.dismiss();
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-8">
        <div className="relative">
          <Loader2 className="w-20 h-20 text-black animate-spin stroke-[1px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Crafting Your Success...</h2>
          <p className="text-gray-500 font-medium italic max-w-xs mx-auto">
            Our AI is analyzing {candidate.fullName}'s profile against 50,000+ job descriptions.
          </p>
        </div>
      </div>
    );
  }

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-12"
      >
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-green-500 text-white shadow-2xl shadow-green-200 mb-2">
            <CheckCircle className="w-12 h-12 stroke-[2.5px]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Career Report Ready</h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Generated for {candidate.fullName}</p>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'resume') && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ATS Score</div>
              <div className="flex items-end space-x-1">
                <span className="text-4xl font-black text-gray-900">{score?.score}</span>
                <span className="text-gray-400 font-bold mb-1">/100</span>
              </div>
            </div>
          )}
          {(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'market') && (
            <>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Value</div>
                <div className="text-3xl font-black text-green-600">₹{salaryInsight?.marketValue}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Percentile</div>
                <div className="text-3xl font-black text-blue-600">{salaryInsight?.percentile}%</div>
              </div>
            </>
          )}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Position</div>
            <div className="text-xl font-black text-gray-900 uppercase tracking-tight">{score?.marketPosition}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Resume Preview */}
          {(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'resume') && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">AI Optimized Resume</h3>
                  </div>
                  <button
                    onClick={downloadResume}
                    className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>

                {/* Resume Content Container */}
                <div className="relative group">
                  <div 
                    id="resume-content" 
                    className="bg-white p-12 border border-gray-200 shadow-inner rounded-xl font-serif text-gray-900 leading-relaxed min-h-[800px]"
                  >
                    <div className="text-center space-y-2 border-b-2 border-gray-900 pb-6 mb-8">
                      <h2 className="text-3xl font-black uppercase tracking-tighter">{candidate.fullName}</h2>
                      <div className="text-sm font-bold text-gray-600 flex justify-center gap-4">
                        <span>{candidate.email}</span>
                        <span>•</span>
                        <span>{candidate.mobile}</span>
                        <span>•</span>
                        <span>{candidate.currentLocation}</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <section className="space-y-3">
                        <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-1">Professional Summary</h4>
                        <p className="text-sm font-medium text-gray-700">{candidate.roleDescription}</p>
                      </section>

                      <section className="space-y-3">
                        <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-1">Core Competencies</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-1">Education</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-black text-sm">{candidate.graduationDegree}</div>
                              <div className="text-xs font-bold text-gray-500">{candidate.graduationCollege}</div>
                            </div>
                            <div className="text-xs font-black text-gray-400">{candidate.graduationYear}</div>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-black text-sm">Higher Secondary (12th)</div>
                              <div className="text-xs font-bold text-gray-500">{candidate.twelfthSchool}</div>
                            </div>
                            <div className="text-xs font-black text-gray-400">{candidate.twelfthYear}</div>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-black text-sm">Secondary (10th)</div>
                              <div className="text-xs font-bold text-gray-500">{candidate.tenthSchool}</div>
                            </div>
                            <div className="text-xs font-black text-gray-400">{candidate.tenthYear}</div>
                          </div>
                        </div>
                      </section>

                      {candidate.experienceYears && candidate.experienceYears > 0 && (
                        <section className="space-y-3">
                          <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-1">Work Experience</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-black text-sm">{candidate.jobRole}</div>
                                <div className="text-xs font-bold text-gray-500">Current Organization</div>
                              </div>
                              <div className="text-xs font-black text-gray-400">{candidate.experienceYears}Y {candidate.experienceMonths}M</div>
                            </div>
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-xl"></div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Insights & Jobs */}
          <div className={`${(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'resume') ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-8`}>
            {/* Score Breakdown */}
            {(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'resume') && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Score Analysis</h3>
                </div>
                <div className="space-y-4">
                  {score?.scoreBreakdown.map((item, i) => (
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
            )}

            {/* Job Matches */}
            {(candidate.paidPlan === 'bundle' || candidate.paidPlan === 'jobs') && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Top Matches</h3>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest">Live Now</span>
                </div>
                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-gray-50 border border-gray-100 space-y-4 hover:border-orange-200 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">{job.role}</div>
                          <div className="text-xs font-bold text-gray-500">{job.company} • {job.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-green-600">₹{job.salaryRange}</div>
                          <div className="text-[10px] font-black text-blue-600">{job.matchScore}% Match</div>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center">
                        Apply Now
                        <ExternalLink className="ml-2 w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-[#25D366] text-white rounded-[2rem] font-black flex flex-col items-center justify-center space-y-2 shadow-xl shadow-green-200 hover:scale-[1.02] transition-transform">
                <MessageCircle className="w-8 h-8" />
                <span className="text-[10px] uppercase tracking-widest">WhatsApp</span>
              </button>
              <button className="p-6 bg-blue-600 text-white rounded-[2rem] font-black flex flex-col items-center justify-center space-y-2 shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform">
                <Share2 className="w-8 h-8" />
                <span className="text-[10px] uppercase tracking-widest">Share Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">AI Improvement Roadmap</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {score?.improvementSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-black text-xs">
                  {i + 1}
                </div>
                <p className="text-gray-300 font-medium leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Spectrum HR Career Accelerator © 2026</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostPayment;
