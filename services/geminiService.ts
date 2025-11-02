import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Language } from '../types';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

const getLanguageName = (code: Language) => {
    switch (code) {
        case 'en': return 'English';
        case 'fr': return 'French';
        case 'de': return 'German';
        case 'he': return 'Hebrew';
        default: return 'English';
    }
}


export const analyzeImageForIngredients = async (base64Image: string, mimeType: string, language: Language): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const languageName = getLanguageName(language);
    const prompt = `Analyze this image of a fridge, pantry, or grocery items. Identify all distinct food items. If a barcode is visible, identify the product. Respond ONLY with a comma-separated list of the items in ${languageName}. For example: "milk, eggs, cheese, bread, chicken breast"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
    });
    
    const text = response.text.trim();
    if (!text) {
      return [];
    }
    return text.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to identify ingredients from the image.");
  }
};

export const generateRecipe = async (inventory: string[], mealType: string, servings: number, language: Language): Promise<Recipe> => {
  if (inventory.length === 0) {
    throw new Error("Cannot generate a recipe with an empty inventory.");
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const languageName = getLanguageName(language);
    const prompt = `Based on the following available ingredients: ${inventory.join(', ')}. Please suggest one recipe for a ${mealType} for ${servings} people, written in ${languageName}. Use the available ingredients as much as possible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "The name of the recipe." },
            description: { type: Type.STRING, description: "A brief, enticing description of the dish." },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of ingredients required for the recipe."
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step instructions to prepare the meal."
            },
          },
          required: ["recipeName", "description", "ingredients", "instructions"],
        },
      },
    });

    const jsonText = response.text;
    const recipeData = JSON.parse(jsonText);
    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate a recipe. The model might be busy or the request was invalid.");
  }
};