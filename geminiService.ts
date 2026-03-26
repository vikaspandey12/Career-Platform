import { GoogleGenAI, Type } from "@google/genai";
import { Candidate, JobMatch, SalaryInsight, ResumeScore } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const extractResumeData = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract candidate information from this resume text: ${text}. 
    Identify and extract the following fields: 
    - firstName
    - lastName
    - fullName
    - mobile (Indian format if possible)
    - email
    - currentLocation (Indian city)
    - preferredLocation (Indian city)
    - experienceYears (number)
    - experienceMonths (number)
    - currentSalary (Annual in INR, number)
    - currentCompany
    - currentDesignation
    - duration (e.g. "2 years 3 months")
    - education: { tenth, twelfth, graduation, pg }
    - roleDescription (detailed, min 4 lines)
    - skills (array of strings)
    
    If a field is missing, set it to null or empty string.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          firstName: { type: Type.STRING },
          lastName: { type: Type.STRING },
          fullName: { type: Type.STRING },
          mobile: { type: Type.STRING },
          email: { type: Type.STRING },
          currentLocation: { type: Type.STRING },
          preferredLocation: { type: Type.STRING },
          experienceYears: { type: Type.NUMBER },
          experienceMonths: { type: Type.NUMBER },
          currentSalary: { type: Type.NUMBER },
          currentCompany: { type: Type.STRING },
          currentDesignation: { type: Type.STRING },
          duration: { type: Type.STRING },
          education: {
            type: Type.OBJECT,
            properties: {
              tenth: { type: Type.STRING },
              twelfth: { type: Type.STRING },
              graduation: { type: Type.STRING },
              pg: { type: Type.STRING }
            }
          },
          roleDescription: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateSalaryInsight = async (candidate: Candidate): Promise<SalaryInsight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze salary for this candidate in the Indian market: ${JSON.stringify(candidate)}. Provide market value range, percentile, and 3 recommendations to increase value.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketValue: { type: Type.STRING },
          percentile: { type: Type.NUMBER },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const matchJobs = async (candidate: Candidate): Promise<JobMatch[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find 3 relevant job matches for this candidate in India: ${JSON.stringify(candidate)}. Include company name, role, salary range, location, interview type, and match score.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            salaryRange: { type: Type.STRING },
            location: { type: Type.STRING },
            interviewType: { type: Type.STRING },
            matchScore: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const improveJobDescription = async (desc: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Improve this job description to be ATS-friendly and professional (min 4 lines, include products, reporting, targets, process): ${desc}`,
  });
  return response.text || desc;
};

export const calculateResumeScore = async (candidate: Candidate): Promise<ResumeScore> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this candidate profile and provide a resume score (0-100), market position (e.g., "Above Average", "Top 10%", "Average"), a breakdown of the score (category, points, maxPoints), and 3-4 improvement suggestions.
    Return ONLY a JSON object with keys: score (number), marketPosition (string), scoreBreakdown (array of objects with keys: category, points, maxPoints), improvementSuggestions (string array).
    Candidate: ${JSON.stringify(candidate)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          marketPosition: { type: Type.STRING },
          scoreBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                points: { type: Type.NUMBER },
                maxPoints: { type: Type.NUMBER }
              }
            }
          },
          improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
