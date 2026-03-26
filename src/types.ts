export interface ScoreBreakdownItem {
  category: string;
  points: number;
  maxPoints: number;
}

export interface Candidate {
  uid: string;
  mobile: string;
  email: string;
  fullName: string;
  currentLocation?: string;
  preferredLocation?: string;
  experienceYears?: number;
  experienceMonths?: number;
  monthlySalary?: number;
  jobRole?: string;
  currentCompany?: string;
  currentDesignation?: string;
  duration?: string;
  graduationDegree?: string;
  graduationCollege?: string;
  graduationYear?: string;
  twelfthSchool?: string;
  twelfthYear?: string;
  tenthSchool?: string;
  tenthYear?: string;
  roleDescription?: string;
  aiInstructions?: string;
  resumeScore?: number;
  marketPosition?: string;
  scoreBreakdown?: ScoreBreakdownItem[];
  improvementSuggestions?: string[];
  skills?: string[];
  isPaid?: boolean;
  paidPlan?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface ResumeScore {
  score: number;
  marketPosition: string;
  scoreBreakdown: ScoreBreakdownItem[];
  improvementSuggestions: string[];
}

export interface JobMatch {
  company: string;
  role: string;
  salaryRange: string;
  location: string;
  interviewType: string;
  matchScore: number;
}

export interface SalaryInsight {
  marketValue: string;
  percentile: number;
  recommendations: string[];
}
