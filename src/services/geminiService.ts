import { Candidate, JobMatch, SalaryInsight, ResumeScore } from "../types";

export const extractResumeData = async (text: string) => {
  const response = await fetch("/api/gemini/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Failed to extract resume data");
  return response.json();
};

export const generateSalaryInsight = async (candidate: Candidate): Promise<SalaryInsight> => {
  const response = await fetch("/api/gemini/salary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate }),
  });
  if (!response.ok) throw new Error("Failed to generate salary insight");
  return response.json();
};

export const matchJobs = async (candidate: Candidate): Promise<JobMatch[]> => {
  const response = await fetch("/api/gemini/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate }),
  });
  if (!response.ok) throw new Error("Failed to match jobs");
  return response.json();
};

export const improveJobDescription = async (desc: string): Promise<string> => {
  const response = await fetch("/api/gemini/improve-desc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ desc }),
  });
  if (!response.ok) throw new Error("Failed to improve job description");
  const data = await response.json();
  return data.text;
};

export const calculateResumeScore = async (candidate: Candidate): Promise<ResumeScore> => {
  const response = await fetch("/api/gemini/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate }),
  });
  if (!response.ok) throw new Error("Failed to calculate resume score");
  return response.json();
};
