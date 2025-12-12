
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerationMode } from "../types";

export const AI_CONFIG = {
  // Using "Nano Banana" (gemini-2.5-flash-image) for image generation/editing
  IMAGE_MODEL: 'gemini-2.5-flash-image',
  TEXT_MODEL: 'gemini-2.5-flash',
  
  // Generation config for image synthesis
  IMAGE_GENERATION_CONFIG: {
    temperature: 0.8, 
    topP: 0.95,
    topK: 40,
    // maxOutputTokens is generally for text, but keeping it consistent doesn't hurt
  },

  // Relaxed safety settings for medical/aesthetic analysis
  SAFETY_SETTINGS: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
};

export const getPromptForMode = (mode: GenerationMode): string => {
  if (mode === 'golden_ratio') {
    return `
      ACT AS: An Expert Plastic Surgeon and Geometrician.
      TASK: Reconstruct this face to strictly adhere to the Golden Ratio (Phi = 1.618).
      
      STRICT INSTRUCTIONS:
      1. RESHAPE: Adjust jawline, chin, and cheekbones to fit the "Marquardt Beauty Mask".
      2. PROPORTION: Re-proportion nose width, eye spacing, and mouth width.
      3. VERTICAL THIRDS: Ensure the hairline-to-brow, brow-to-nose, and nose-to-chin distances are Equal.
      
      OUTPUT REQUIREMENT:
      - Maintain the original skin texture, lighting, and ethnicity.
      - The result must be PHOTOREALISTIC.
      - Do not simply smooth the skin; actually CHANGE THE BONE STRUCTURE to match Phi.
    `;
  } else {
    return `
      ACT AS: An Expert Maxillofacial Surgeon specializing in symmetry.
      TASK: Digitally correct all bilateral asymmetries in this face.
      
      SURGICAL STEPS:
      1. NOSE: Center the nasal bridge and tip perfectly on the midline.
      2. EYES: Level the canthal tilt and horizontal axis. Both eyes must be strictly identical in height.
      3. BROWS: Match the eyebrow arches and tail heights.
      4. JAW & CHIN: Sculpt the mandible to be symmetrical. Center the mental protuberance (chin point).
      5. MOUTH: Align the oral commissures (corners of mouth).
      
      CONSTRAINT:
      - Independently warp and shift features to their ideal symmetric coordinate.
      - Keep it realistic.
      - Image should significantly different than the one uploaded, but should have features of the same person.
    `;
  }
};
