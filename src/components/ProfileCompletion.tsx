import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, MapPin, Briefcase, GraduationCap, IndianRupee, Info, ArrowLeft, Search } from 'lucide-react';
import { Candidate } from '../types';
import { improveJobDescription } from '../services/geminiService';
import { toast } from 'sonner';

interface Props {
  candidate: Candidate;
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad"
];

const ProfileCompletion = ({ candidate, updateCandidate }: Props) => {
  const [formData, setFormData] = useState({
    fullName: candidate.fullName || '',
    email: candidate.email || '',
    mobile: candidate.mobile || '',
    currentLocation: candidate.currentLocation || '',
    preferredLocation: candidate.preferredLocation || '',
    experienceYears: candidate.experienceYears || 0,
    experienceMonths: candidate.experienceMonths || 0,
    monthlySalary: candidate.monthlySalary || 0,
    currentCompany: candidate.currentCompany || '',
    currentDesignation: candidate.currentDesignation || '',
    duration: candidate.duration || '',
    roleDescription: candidate.roleDescription || '',
    aiInstructions: candidate.aiInstructions || '',
    jobRole: candidate.jobRole || '',
    graduationDegree: candidate.graduationDegree || '',
    graduationCollege: candidate.graduationCollege || '',
    graduationYear: candidate.graduationYear || '',
    twelfthSchool: candidate.twelfthSchool || '',
    twelfthYear: candidate.twelfthYear || '',
    tenthSchool: candidate.tenthSchool || '',
    tenthYear: candidate.tenthYear || '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [activeLocationField, setActiveLocationField] = useState<'current' | 'preferred' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile: string) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleLocationChange = (value: string, field: 'current' | 'preferred') => {
    setFormData({ ...formData, [field === 'current' ? 'currentLocation' : 'preferredLocation']: value });
    if (value.length > 1) {
      const filtered = INDIAN_CITIES.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setLocationSuggestions(filtered);
      setActiveLocationField(field);
    } else {
      setLocationSuggestions([]);
      setActiveLocationField(null);
    }
  };

  const selectLocation = (city: string) => {
    if (activeLocationField === 'current') {
      setFormData({ ...formData, currentLocation: city });
    } else if (activeLocationField === 'preferred') {
      setFormData({ ...formData, preferredLocation: city });
    }
    setLocationSuggestions([]);
    setActiveLocationField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!validateMobile(formData.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    setLoading(true);
    try {
      // Improve role description using AI
      const improvedDesc = await improveJobDescription(formData.roleDescription);
      const fullName = formData.fullName.trim();
      await updateCandidate({ ...formData, fullName, roleDescription: improvedDesc });
      navigate('/preview');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 relative">
      <button
        onClick={() => navigate('/upload')}
        className="absolute top-6 left-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Complete Your Profile</h2>
          <p className="text-gray-500 italic">Please verify and fill in any missing mandatory details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Personal Details
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name *</label>
              <input
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. Vikas Pandey"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. vikas@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, mobile: val });
                    if (errors.mobile) setErrors({ ...errors, mobile: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all ${
                    errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="e.g. 9876543210"
                />
                {errors.mobile && <p className="text-xs text-red-500 font-medium">{errors.mobile}</p>}
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700">Current Location *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) => handleLocationChange(e.target.value, 'current')}
                    onFocus={() => setActiveLocationField('current')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    placeholder="e.g. Mumbai"
                  />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {activeLocationField === 'current' && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden">
                    {locationSuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectLocation(city)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-gray-700">Preferred Job Location *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formData.preferredLocation}
                    onChange={(e) => handleLocationChange(e.target.value, 'preferred')}
                    onFocus={() => setActiveLocationField('preferred')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    placeholder="e.g. Remote, Bangalore"
                  />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {activeLocationField === 'preferred' && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden">
                    {locationSuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => selectLocation(city)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Company *</label>
                <input
                  required
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Global Solutions"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Designation *</label>
                <input
                  required
                  type="text"
                  value={formData.currentDesignation}
                  onChange={(e) => setFormData({ ...formData, currentDesignation: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Sales Manager"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Total Experience *</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Years"
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    max="11"
                    value={formData.experienceMonths}
                    onChange={(e) => setFormData({ ...formData, experienceMonths: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Months"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1 text-gray-400" />
                  Monthly Salary *
                </label>
                <div className="space-y-1">
                  <input
                    required
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 25000"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">Example: ₹25,000 per month</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span className="flex items-center">
                  <Info className="w-4 h-4 mr-1 text-gray-400" />
                  Detailed Job Role *
                </span>
                <span className="text-xs font-normal text-gray-400 italic">Min 4 lines (Products, Reporting, Targets)</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.roleDescription}
                onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your role, products handled, reporting structure, targets, and processes..."
              />
            </div>
          </div>

          {/* AI Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              AI Customization (Optional)
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Instructions for AI</label>
              <textarea
                rows={3}
                value={formData.aiInstructions}
                onChange={(e) => setFormData({ ...formData, aiInstructions: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific focus for your resume? (e.g., Highlight sales achievements, focus on leadership roles, etc.)"
              />
            </div>
          </div>

          {/* Education Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Education
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">10th School *</label>
                  <input
                    required
                    placeholder="e.g. St. Xavier's"
                    value={formData.tenthSchool}
                    onChange={(e) => setFormData({ ...formData, tenthSchool: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">10th Year *</label>
                  <input
                    required
                    placeholder="e.g. 2015"
                    value={formData.tenthYear}
                    onChange={(e) => setFormData({ ...formData, tenthYear: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">12th School *</label>
                  <input
                    required
                    placeholder="e.g. KV No. 1"
                    value={formData.twelfthSchool}
                    onChange={(e) => setFormData({ ...formData, twelfthSchool: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">12th Year *</label>
                  <input
                    required
                    placeholder="e.g. 2017"
                    value={formData.twelfthYear}
                    onChange={(e) => setFormData({ ...formData, twelfthYear: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Graduation Degree *</label>
                  <input
                    required
                    placeholder="e.g. B.Tech CSE"
                    value={formData.graduationDegree}
                    onChange={(e) => setFormData({ ...formData, graduationDegree: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Graduation College *</label>
                  <input
                    required
                    placeholder="e.g. IIT Bombay"
                    value={formData.graduationCollege}
                    onChange={(e) => setFormData({ ...formData, graduationCollege: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {loading ? 'Processing...' : 'Continue to Preview'}
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileCompletion;
