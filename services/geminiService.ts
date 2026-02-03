import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constants";
import { OCRResult } from "../types";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Uses Gemini 2.0 Flash (Multimodal) to extract data directly from an image.
 * This model has superior vision capabilities for handwritten forms.
 */
export const extractDataFromImage = async (base64Data: string, mimeType: string): Promise<OCRResult> => {
  try {
    // 1. Configure the model - using 2.0 Flash for best speed/accuracy balance in Vision
    const modelId = "gemini-2.0-flash-exp"; 
    
    // 2. Define the extraction schema strictly
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        department: { type: Type.STRING },
        designation: { type: Type.STRING },
        salary: { type: Type.NUMBER },
        joinDate: { type: Type.STRING },
        confidence: { type: Type.NUMBER, description: "Confidence score 0-1 based on legibility" }
      },
      required: ["fullName", "email", "department", "designation", "salary", "joinDate"]
    };

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `You are an advanced OCR AI for Indian HR documents. Analyze this Employee Enrollment Form image.
            
            Extract the following fields into strict JSON:
            1. **Full Name**: Look for "Full Name".
            2. **Email**: Look for "Email Address".
            3. **Department**: Look for "Department".
            4. **Role**: Look for "Job Role" or "Designation".
            5. **Salary**: Look for "Annual Salary" or "CTC". Return only the number (e.g., 500000). Remove currency symbols like ₹, Rs, INR, or commas.
            6. **Join Date**: Look for "Join Date". Convert ANY date format found (e.g., "12th Jan 2024", "12/01/2024") into strict ISO format "YYYY-MM-DD".

            **Rules**:
            - If handwritten text is ambiguous, infer from context.
            - If a field is completely missing or illegible, return "Unknown" (string) or 0 (number).
            - Do not return Markdown code blocks, just the JSON object.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    if (response.text) {
      // 3. Robust Parsing: Strip Markdown code blocks if present (common Gemini behavior)
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as OCRResult;
    }
    
    throw new Error("No extracted text returned from AI");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Return empty fallback with low confidence
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