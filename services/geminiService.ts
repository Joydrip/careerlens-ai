
import { GoogleGenAI, Type } from "@google/genai";
import { VideoEntry, AnalysisResult } from "../types";

export const analyzeWatchHistory = async (videos: VideoEntry[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  // To optimize for context limits and speed, we sample the most recent videos if the list is huge
  const recentVideos = videos.slice(0, 300);
  const videoContext = recentVideos.map(v => `${v.title} (${v.channelName})`).join("\n");

  const systemInstruction = `
    You are a world-class Career Analyst and NLP Data Scientist.
    Your task is to perform the "Data Enrichment" and "Feature Engineering" layers for a Career Recommendation engine.
    
    1. Enrichment: Categorize each video into professional domains (e.g., Software Engineering, UX Design, Marketing).
    2. Feature Engineering: 
       - Calculate percentage of time spent per domain.
       - Extract skill keywords (e.g., Python, Figma, Strategic Planning).
       - Determine a "Learning vs Entertainment" ratio based on content types.
    3. Matching: Map these features to 3 specific career paths with weighted scoring.
    
    Output everything in valid JSON format.
  `;

  const prompt = `
    Analyze this user's YouTube Watch History (Sample of ${recentVideos.length} recent videos):
    ---
    ${videoContext}
    ---
    
    Provide:
    1. A breakdown of domains with percentages.
    2. Top 8 inferred skills with scores (0-100).
    3. A professional summary.
    4. 3 Career Recommendations with match scores and roadmaps.
    5. A calculated learningRatio (0-100) where high means educational/career-growth content.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              learningRatio: { type: Type.NUMBER },
              dateRange: { type: Type.STRING }
            },
            required: ["learningRatio", "dateRange"]
          },
          domains: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                percentage: { type: Type.NUMBER },
                color: { type: Type.STRING }
              },
              required: ["name", "percentage", "color"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["name", "value"]
            }
          },
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                matchScore: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                skillsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                roadmapSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "matchScore", "reason", "skillsNeeded", "roadmapSteps"]
            }
          }
        },
        required: ["metadata", "domains", "skills", "summary", "recommendations"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      metadata: {
        ...data.metadata,
        totalVideos: videos.length
      }
    } as AnalysisResult;
  } catch (error) {
    console.error("Analysis layer failed:", error);
    throw new Error("Data processing failed.");
  }
};
