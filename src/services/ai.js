import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateDestinations(budget, tripType, duration) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an expert travel agent. 
    A user wants to go on a trip. 
    Preferences:
    - Budget: ${budget}
    - Trip Type: ${tripType}
    - Duration: ${duration} days

    Please suggest exactly 3 different destination options that perfectly match these criteria.
    Return ONLY a valid JSON array of objects. No markdown formatting, no code blocks, just raw JSON.
    Format of each object:
    {
      "name": "City/Location Name",
      "country": "Country Name",
      "description": "A short, engaging 2-sentence description of why it fits the criteria.",
      "estimatedCost": "Estimated total cost range in USD"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Robustly extract the JSON array
    const startIndex = responseText.indexOf('[');
    const endIndex = responseText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = responseText.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } else {
      console.error("Raw response:", responseText);
      throw new Error("AI did not return a valid JSON array.");
    }
  } catch (error) {
    console.error("Error generating destinations:", error);
    throw error;
  }
}

export async function generateItinerary(destination, duration, budget) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an expert travel agent. Create a detailed day-by-day itinerary for a trip.
    Details:
    - Destination: ${destination.name}, ${destination.country}
    - Duration: ${duration} days
    - Budget Level: ${budget}

    Return ONLY a valid JSON array of objects. No markdown formatting, no code blocks.
    Format of each object (one for each day):
    {
      "day": "Day Number (e.g., 1)",
      "title": "A catchy title for the day's theme",
      "activities": [
        "Morning: [Activity description]",
        "Afternoon: [Activity description]",
        "Evening: [Activity description]"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Robustly extract the JSON array
    const startIndex = responseText.indexOf('[');
    const endIndex = responseText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = responseText.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } else {
      console.error("Raw response:", responseText);
      throw new Error("AI did not return a valid JSON array.");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}
