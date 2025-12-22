
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { Dish, Category, Ingredient, MealPlan, CuisineType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are ChefMate, a smart kitchen assistant.
Your goal is to suggest meals based on inventory, prioritizing ingredients that are expiring soon.

Key Responsibilities:
1. **Waste Reduction**: Always prioritize ingredients with imminent expiry dates.
2. **Cuisine Adaptation**: Strictly follow the user's preferred cuisines (e.g., Sichuan, Cantonese).
3. **Recipe Details**: When suggesting a specific dish, you MUST provide a "View Recipe" section.

Formatting Rules:
- Use Markdown.
- Keep the initial suggestion conversational and brief (2-3 sentences).
- If you suggest a specific meal, append a detailed recipe section at the end of your message.
- **CRITICAL**: Separate the conversational part from the recipe using the delimiter "---RECIPE---".
- In the recipe section, include: Ingredients list, Step-by-step instructions, Time estimate, Nutrition info (approx).
`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const generateMealSuggestion = async (
  chat: Chat,
  message: string,
  inventory: Ingredient[],
  mealPlan: MealPlan,
  selectedDate: string,
  preferences: CuisineType[]
): Promise<string> => {
  const inventoryList = inventory.map(i => {
    const expiry = i.expiryDate ? `(Exp: ${i.expiryDate})` : '';
    return `- ${i.name} [${i.category}] ${expiry}`;
  }).join('\n');

  const currentPlan = JSON.stringify(mealPlan);
  const prefs = preferences.length > 0 ? preferences.join(', ') : 'General Chinese';

  const contextPrompt = `
[Context Update]
**User Preferences**: ${prefs}
**Current Date**: ${new Date().toISOString().split('T')[0]}
**Focus Date**: ${selectedDate}
**Inventory**:
${inventoryList || "Empty"}

**Meal Plan**: ${currentPlan}

[User Input]
${message}
`;

  try {
    const response = await chat.sendMessage({ message: contextPrompt });
    return response.text || "I'm having trouble thinking of a recipe right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, I'm having trouble connecting to my cookbook database (API Error).";
  }
};

export const generateFridgeBackground = async (): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: 'A colorful, cute comic book style illustration of a closed kitchen refrigerator. Flat design, vector art style, vibrant colors. No text.' }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

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
    return results.map((d: any) => ({
      ...d,
      id: d.id || Math.random().toString(36).substr(2, 9),
      thumbnailUrl: d.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(d.title)}/400/300`,
      category
    }));
  } catch (error) {
    console.error("Error generating recipes:", error);
    return [];
  }
}
