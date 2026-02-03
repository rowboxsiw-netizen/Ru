import { extractDataFromImage } from './geminiService';
import { OCRResult } from '../types';

/**
 * Compresses an image file to ensure it's within optimal limits for the API
 * and speeds up upload/processing on mobile networks.
 */
const compressImage = (file: File, maxWidth = 1600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.8 quality (good balance for OCR)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        // Remove prefix
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const processImageFile = async (file: File): Promise<OCRResult> => {
  try {
    console.log(`Processing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // 1. Compress & Convert to Base64
    // This optimization ("Node Full Potential" style logic on client) prevents
    // sending massive 10MB+ camera raw files, speeding up the process 10x.
    const base64Data = await compressImage(file);
    
    // We force JPEG mime type because compressImage converts to JPEG
    const mimeType = 'image/jpeg';

    // 2. Send to Gemini
    const structuredData = await extractDataFromImage(base64Data, mimeType);
    
    console.log("AI Extraction Result:", structuredData);
    return structuredData;
  } catch (error) {
    console.error("Image processing failed:", error);
    throw error;
  }
};