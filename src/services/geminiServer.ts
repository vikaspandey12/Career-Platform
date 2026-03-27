import { GoogleGenAI, Type } from "@google/genai";
import { Candidate } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set on the server. Please check your Render environment variables.");
    }
    
    // Check for common placeholder values
    if (apiKey === "MY_GEMINI_API_KEY" || apiKey === "YOUR_API_KEY_HERE" || apiKey.startsWith("TODO")) {
      throw new Error("GEMINI_API_KEY is still set to a placeholder value. Please update it with your actual Gemini API key from Google AI Studio.");
    }

    console.log(`Initializing Gemini AI with key (prefix: ${apiKey.substring(0, 6)}...)`);
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const extractResumeData = async (text: string) => {
  console.log("Calling Gemini to extract resume data...");
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract candidate information from this resume text: ${text}. 
      Return the data in a structured JSON format. 
      If a field is not found, use an empty string or 0 as appropriate.
      
      Fields to extract:
      - fullName
      - email
      - mobile (10 digits)
      - currentLocation (Indian city)
      - preferredLocation (Indian city)
      - experienceYears (number)
      - experienceMonths (number)
      - monthlySalary (Monthly in INR, number)
      - currentCompany
      - currentDesignation
      - roleDescription (detailed summary of their current/last role, min 4 lines)
      - graduationDegree
      - graduationCollege
      - graduationYear
      - tenthSchool
      - tenthYear
      - twelfthSchool
      - twelfthYear
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            mobile: { type: Type.STRING },
            currentLocation: { type: Type.STRING },
            preferredLocation: { type: Type.STRING },
            experienceYears: { type: Type.NUMBER },
            experienceMonths: { type: Type.NUMBER },
            monthlySalary: { type: Type.NUMBER },
            currentCompany: { type: Type.STRING },
            currentDesignation: { type: Type.STRING },
            roleDescription: { type: Type.STRING },
            graduationDegree: { type: Type.STRING },
            graduationCollege: { type: Type.STRING },
            graduationYear: { type: Type.STRING },
            tenthSchool: { type: Type.STRING },
            tenthYear: { type: Type.STRING },
            twelfthSchool: { type: Type.STRING },
            twelfthYear: { type: Type.STRING }
          }
        }
      }
    });
    console.log("Gemini successfully extracted resume data");
    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }
    
    try {
      // Sometimes Gemini wraps JSON in markdown code blocks
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : rawText;
      return JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", rawText);
      throw new Error("Failed to parse extracted data. Please try again.");
    }
  } catch (error: any) {
    console.error("Error in extractResumeData:", error);
    throw error;
  }
};

export const generateSalaryInsight = async (candidate: Candidate) => {
  console.log("Calling Gemini to generate salary insight...");
  try {
    const ai = getAI();
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
    console.log("Gemini successfully generated salary insight");
    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response for salary insight");
    }
    
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : rawText;
      return JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error("Failed to parse Gemini salary insight as JSON:", rawText);
      throw new Error("Failed to parse salary insight data.");
    }
  } catch (error: any) {
    console.error("Error in generateSalaryInsight:", error);
    throw error;
  }
};

export const matchJobs = async (candidate: Candidate) => {
  console.log("Calling Gemini to match jobs...");
  try {
    const ai = getAI();
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
    console.log("Gemini successfully matched jobs");
    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response for job matching");
    }
    
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : rawText;
      return JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error("Failed to parse Gemini job matches as JSON:", rawText);
      throw new Error("Failed to parse job match data.");
    }
  } catch (error: any) {
    console.error("Error in matchJobs:", error);
    throw error;
  }
};

export const improveJobDescription = async (desc: string) => {
  console.log("Calling Gemini to improve job description...");
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve this job description to be ATS-friendly and professional (min 4 lines, include products, reporting, targets, process): ${desc}`,
    });
    
    if (!response.text) {
      console.warn("Gemini returned an empty response for job description improvement");
      return desc;
    }
    
    console.log("Gemini successfully generated an improved job description");
    return response.text;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const calculateResumeScore = async (candidate: Candidate) => {
  console.log("Calling Gemini to calculate resume score...");
  try {
    const ai = getAI();
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
    console.log("Gemini successfully calculated resume score");
    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response for resume score");
    }
    
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : rawText;
      return JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error("Failed to parse Gemini resume score as JSON:", rawText);
      throw new Error("Failed to parse resume score data.");
    }
  } catch (error: any) {
    console.error("Error in calculateResumeScore:", error);
    throw error;
  }
};
