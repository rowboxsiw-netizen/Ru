import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constants";
import { OCRResult } from "../types";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Uses Gemini Vision (Multimodal) to extract data directly from an image.
 * This is significantly more accurate than text-only OCR for forms.
 */
export const extractDataFromImage = async (base64Data: string, mimeType: string): Promise<OCRResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this Employee Enrollment Form image (India context) and extract the following details into a strict JSON format.
            
            Fields to Extract:
            1. Full Name (Look for "Full Name" block)
            2. Email Address (Look for "Email Address" block)
            3. Department (Look for "Department" block)
            4. Job Role / Title (Look for "Designation" or "Job Role" block)
            5. Annual Salary (Look for "Annual Salary" or "CTC", return number only. Ignore symbols like ₹, Rs, INR)
            6. Join Date (Look for "Join Date", convert to YYYY-MM-DD ISO format for database, even if written as DD/MM/YYYY)

            If a field is empty, handwritten illegibly, or missing, use reasonable defaults or empty strings.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            department: { type: Type.STRING },
            designation: { type: Type.STRING },
            salary: { type: Type.NUMBER },
            joinDate: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
          },
          required: ["fullName", "email", "department", "designation", "salary", "joinDate"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as OCRResult;
    }
    
    throw new Error("No extracted text returned from AI");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Return empty fallback
    return {
      fullName: "",
      email: "",
      department: "",
      designation: "",
      salary: 0,
      joinDate: new Date().toISOString().split('T')[0],
      confidence: 0
    };
  }
};