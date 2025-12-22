
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRecipes(category: Category, ingredients: string[]): Promise<Dish[]> {
  const prompt = `Generate 3 recipe ideas for ${category} ${ingredients.length > 0 ? `using some of these ingredients: ${ingredients.join(', ')}` : 'using common fridge staples'}. 
  Focus on quick and healthy meals. Provide details in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timeMins: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              rating: { type: Type.NUMBER },
              thumbnailUrl: { type: Type.STRING },
              category: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "description", "timeMins", "calories", "rating", "category"]
          }
        }
      }
    });

    const results = JSON.parse(response.text);
    // Add random images if none provided
    return results.map((d: any) => ({
      ...d,
      id: d.id || Math.random().toString(36).substr(2, 9),
      thumbnailUrl: d.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(d.title)}/400/300`,
      category: category // Ensure category matches
    }));
  } catch (error) {
    console.error("Error generating recipes:", error);
    return []; // Return empty array to fall back to static data
  }
}
