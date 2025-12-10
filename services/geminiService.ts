import { GoogleGenAI, Type } from "@google/genai";
import { VerseData, AIInsight } from '../types';

const modelId = "gemini-2.5-flash";

// Helper to safely get AI instance
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function used by scriptureService
export const searchVerse = async (query: string, version: string = 'KJV'): Promise<VerseData> => {
  const ai = getAIClient();
  if (!ai) throw new Error("Offline Mode: API Key missing.");

  const prompt = `
    Find the scripture verse described by this query: "${query}".
    
    Search Scope:
    - Holy Bible (${version})
    - The Book of Mormon
    - Doctrine and Covenants
    - Pearl of Great Price
    
    Instructions:
    - If the user provides a specific reference (e.g., "1 Nephi 3:7", "Alma 32:21", "D&C 4"), retrieve that exact text.
    - If the user provides a topic or phrase (e.g., "faith", "men are that they might have joy"), find the most relevant verse from the Standard Works.
    - Accurately identify the Book, Chapter, and Verse.
    
    Return JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reference: { type: Type.STRING, description: "e.g., 1 Nephi 3:7" },
            text: { type: Type.STRING, description: "The verse text content" },
            book: { type: Type.STRING },
            chapter: { type: Type.INTEGER },
            verse: { type: Type.INTEGER },
            version: { type: Type.STRING, description: "e.g., KJV, Book of Mormon, D&C" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 keywords describing the mood/theme"
            }
          },
          required: ["reference", "text", "book", "chapter", "verse", "version"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VerseData;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error fetching verse:", error);
    throw new Error("Failed to find verse. Please try a clearer reference.");
  }
};

export const getVerseInsights = async (reference: string, text: string): Promise<AIInsight> => {
  const ai = getAIClient();
  if (!ai) {
    return {
      context: "Offline Mode.",
      theology: "AI Insights unavailable.",
      application: "Please check internet/API Key."
    };
  }

  const prompt = `
    Analyze this scripture verse: "${reference} - ${text}".
    Provide brief, presentable insights for a slide show.
    
    Context:
    - If this is from the Bible, provide historical/biblical context.
    - If this is from the Book of Mormon, Doctrine and Covenants, or Pearl of Great Price, provide the specific restoration context (e.g., Lehi's family, Joseph Smith's revelation).
    
    Constraints:
    - Keep each section under 30 words.
    - Use simple, reverent language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: { type: Type.STRING, description: "Historical or situational context (max 30 words)" },
            theology: { type: Type.STRING, description: "Theological significance (max 30 words)" },
            application: { type: Type.STRING, description: "Practical application (max 30 words)" },
          },
          required: ["context", "theology", "application"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIInsight;
    }
    return {
      context: "Context unavailable.",
      theology: "Insight unavailable.",
      application: "Application unavailable."
    };
  } catch (error) {
    console.error("Error getting insights:", error);
    return {
      context: "Could not load context.",
      theology: "Could not load theology.",
      application: "Could not load application."
    };
  }
};