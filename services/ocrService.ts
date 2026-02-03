import { extractDataFromImage } from './geminiService';
import { OCRResult } from '../types';

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const processImageFile = async (file: File): Promise<OCRResult> => {
  try {
    console.log("Processing image with Gemini Vision...");
    
    // 1. Convert File to Base64 for API
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    // 2. Send directly to Gemini (Multimodal)
    // This uses the "Full Potential" of the AI to see the layout + text
    const structuredData = await extractDataFromImage(base64Data, mimeType);
    
    console.log("AI Extraction Result:", structuredData);
    return structuredData;
  } catch (error) {
    console.error("Image processing failed:", error);
    throw error;
  }
};