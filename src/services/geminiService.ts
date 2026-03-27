import { Candidate, JobMatch, SalaryInsight, ResumeScore } from "../types";

export const extractResumeData = async (text: string) => {
  try {
    console.log("Sending resume text to backend for extraction...");
    const response = await fetch("/api/gemini/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      let errorMessage = `Server responded with ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("Could not parse error response as JSON", e);
      }
      console.error("Extraction failed:", errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log("Successfully extracted resume data");
    return data;
  } catch (error: any) {
    console.error("Detailed error in extractResumeData:", error);
    throw new Error(error.message || "Failed to extract resume data. Please check your internet connection or try again later.");
  }
};

export const generateSalaryInsight = async (candidate: Candidate): Promise<SalaryInsight> => {
  try {
    const response = await fetch("/api/gemini/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error("Error generating salary insight:", error);
    throw new Error(error.message || "Failed to generate salary insight");
  }
};

export const matchJobs = async (candidate: Candidate): Promise<JobMatch[]> => {
  try {
    const response = await fetch("/api/gemini/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error("Error matching jobs:", error);
    throw new Error(error.message || "Failed to match jobs");
  }
};

export const improveJobDescription = async (desc: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/improve-desc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desc }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Error improving job description:", error);
    throw new Error(error.message || "Failed to improve job description");
  }
};

export const calculateResumeScore = async (candidate: Candidate): Promise<ResumeScore> => {
  try {
    const response = await fetch("/api/gemini/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error("Error calculating resume score:", error);
    throw new Error(error.message || "Failed to calculate resume score");
  }
};
