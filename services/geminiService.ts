import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constants";
import { OCRResult } from "../types";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const extractDataFromImage = async (base64Data: string, mimeType: string): Promise<OCRResult> => {
  try {
    const modelId = "gemini-2.0-flash-exp"; 
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        sku: { type: Type.STRING },
        category: { type: Type.STRING },
        supplier: { type: Type.STRING },
        price: { type: Type.NUMBER },
        quantity: { type: Type.NUMBER },
        confidence: { type: Type.NUMBER }
      },
      required: ["name", "sku", "category", "price", "quantity"]
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
            text: `You are an intelligent Inventory Scanner for an Indian Warehouse. Analyze this Product Label, Invoice, or Stock Sheet.
            
            Extract the following into strict JSON:
            1. **Product Name**: The main label or description.
            2. **SKU**: Look for "SKU", "Item Code", "Model No", or Barcode numbers.
            3. **Category**: Infer from the product name (e.g., Laptop -> Electronics, Chair -> Furniture).
            4. **Supplier**: Look for "Mfr", "Vendor", or "Sold By".
            5. **Price**: Look for "MRP", "Price", or "Rate". Return numeric value only (remove ₹/Rs).
            6. **Quantity**: Look for "Qty", "Count", or "Net Weight". If not found, default to 1.

            **Rules**:
            - Infer category from standard list: Electronics, Furniture, Groceries, Clothing, Hardware, Pharma.
            - If SKU is missing, generate a short one based on Name (e.g., "LAP-001").
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      }
    });

    if (response.text) {
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as OCRResult;
    }
    
    throw new Error("No extracted text returned from AI");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      name: "",
      sku: "",
      category: "Electronics",
      supplier: "",
      price: 0,
      quantity: 1,
      confidence: 0
    };
  }
};