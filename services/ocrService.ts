import Tesseract from 'tesseract.js';
import { parseOCRText } from './geminiService';
import { OCRResult } from '../types';

export const processImageFile = async (file: File): Promise<OCRResult> => {
  try {
    // 1. Basic Tesseract Recognition
    // We scan the whole image because user cropping might be imperfect.
    // The "Anchor Box" concept in the PDF helps the user write clearly,
    // but Gemini is smarter at finding that text regardless of exact pixel coordinates.
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => console.log(m) // Optional progress logging
      }
    );

    const rawText = result.data.text;
    console.log("Raw OCR Text:", rawText);

    // 2. AI Post-Processing (High Fidelity Data Extraction)
    const structuredData = await parseOCRText(rawText);
    
    return structuredData;
  } catch (error) {
    console.error("OCR Processing failed:", error);
    throw error;
  }
};