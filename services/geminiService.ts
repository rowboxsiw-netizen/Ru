import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constants";
import { OCRResult } from "../types";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// This function takes raw, potentially messy text from Tesseract
// and uses Gemini to extract structured data.
export const parseOCRText = async (rawText: string): Promise<OCRResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest",
      contents: `Extract the following fields from this OCR text scan of an employee form: Full Name, Department, and Designation (or Role).
      
      The OCR text is:
      """
      ${rawText}
      """

      Return the result in JSON format.
      If a field is missing or illegible, put "Unknown".
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            department: { type: Type.STRING },
            designation: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "A number between 0 and 1 indicating how confident you are that this is a valid form" }
          },
          required: ["fullName", "department", "designation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as OCRResult;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return {
      fullName: "",
      department: "",
      designation: "",
      confidence: 0
    };
  }
};