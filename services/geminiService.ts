
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, GenerationMode } from "../types";
import { AI_CONFIG, getPromptForMode } from "../config/aiConfig";

// Helper to strip the header for API usage
const stripBase64Header = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const generateIdealFace = async (base64Image: string, mode: GenerationMode): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mimeType = getMimeType(base64Image);
  const cleanBase64 = stripBase64Header(base64Image);
  const prompt = getPromptForMode(mode);

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.IMAGE_MODEL,
      config: {
        safetySettings: AI_CONFIG.SAFETY_SETTINGS,
        // Spread the generation config (temp, topP, etc)
        ...AI_CONFIG.IMAGE_GENERATION_CONFIG
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let generatedImageBase64 = '';
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content && content.parts) {
        const parts = content.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!generatedImageBase64) {
      const finishReason = candidates?.[0]?.finishReason;
      
      // Attempt to extract text if image is missing to understand why
      let textContent = '';
      if (candidates?.[0]?.content?.parts) {
         const textParts = candidates[0].content.parts.filter(p => p.text).map(p => p.text);
         if (textParts.length > 0) textContent = textParts.join(' ');
      }

      console.error("Gemini generation failed. Finish reason:", finishReason, "Text output:", textContent);
      
      if (textContent) {
        // If the model spoke instead of generating an image, pass that message to the user
        // This often happens if the request is refused or misunderstood
        throw new Error(`Model response (No Image): ${textContent.slice(0, 150)}${textContent.length > 150 ? '...' : ''}`);
      }

      if (finishReason === 'SAFETY') {
         throw new Error("The image was flagged by safety filters. Please try a clearer, neutral portrait.");
      }
      
      throw new Error(`AI generation failed. Reason: ${finishReason || 'Unknown'}`);
    }

    return generatedImageBase64;
  } catch (error) {
    console.error("Error generating ideal face:", error);
    throw error;
  }
};

export const analyzeAndPrescribe = async (originalBase64: string, idealBase64: string, mode: GenerationMode): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const cleanOriginal = stripBase64Header(originalBase64);
  const cleanIdeal = stripBase64Header(idealBase64);
  
  const modeLabel = mode === 'golden_ratio' ? "Golden Ratio" : "Perfect Symmetry";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      symmetryScore: { type: Type.NUMBER, description: "Current symmetry score out of 100" },
      achievabilityScore: { type: Type.NUMBER, description: "Percentage of the ideal look achievable through natural exercise (0-100)" },
      analysisSummary: { type: Type.STRING, description: "A brief paragraph analyzing the user's face structure vs the target." },
      keyDifferences: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 3-5 key structural differences identified."
      },
      exercises: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            targetArea: { type: Type.STRING },
            instructions: { type: Type.STRING },
            duration: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          }
        }
      }
    },
    required: ["symmetryScore", "achievabilityScore", "analysisSummary", "keyDifferences", "exercises"]
  };

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.TEXT_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanOriginal
            }
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanIdeal
            }
          },
          {
            text: `The first image is the user's original face. The second image is the AI-generated '${modeLabel}' version of their face.
            1. Analyze the facial landmarks and structure of the original image compared to the generated version.
            2. Determine what facial yoga, mewing, or massage exercises can help the user move towards this generated structure (e.g., sharper jawline, higher cheekbones, symmetrical eyes).
            3. Be realistic about what is achievable naturally (muscular hypertrophy/toning) vs bone structure.
            4. Provide a JSON response.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        safetySettings: AI_CONFIG.SAFETY_SETTINGS,
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
       throw new Error("No analysis generated by AI.");
    }
    
    // Improved text extraction using response.text
    const text = response.text;
    
    if (!text) {
        throw new Error("Analysis generated empty response.");
    }
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing face:", error);
    throw error;
  }
};
