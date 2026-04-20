import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const PRIMARY_MODEL =
  import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-1.5-flash-001";

function getErrorMessage(err) {
  if (!err) return "";
  if (typeof err === "string") return err;
  return String(err?.message || err);
}

function parseRetryAfterSeconds(err) {
  try {
    const msg = getErrorMessage(err);
    const fromText = msg.match(/Please retry in\s+(\d+(\.\d+)?)s/i);
    if (fromText?.[1]) return Math.ceil(Number(fromText[1]));

    const fromJson = msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
    if (fromJson?.[1]) return Number(fromJson[1]);
  } catch {
    // ignore
  }
  return null;
}

function isQuotaError(err) {
  const msg = getErrorMessage(err);
  return msg.includes("[429") || msg.includes("429") || msg.includes("Quota exceeded");
}

async function generateWithFallback(prompt) {
  const fallbacks = [
    PRIMARY_MODEL,
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
  ];

  let lastError;
  for (const modelName of fallbacks) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      if (isQuotaError(err)) {
        const retryAfterSeconds = parseRetryAfterSeconds(err);
        const quotaError = new Error(
          retryAfterSeconds
            ? `Gemini quota exceeded. Please retry in ${retryAfterSeconds}s.`
            : "Gemini quota exceeded. Please retry later."
        );
        quotaError.name = "GeminiQuotaError";
        quotaError.retryAfterSeconds = retryAfterSeconds;
        throw quotaError;
      }
      const msg = getErrorMessage(err);
      const isNotFound =
        msg.includes("404") ||
        msg.includes("NOT_FOUND") ||
        msg.includes("is not found for API version");
      if (!isNotFound) break;
    }
  }
  throw lastError;
}

export async function generateDestinations(budget, tripType, duration) {
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
    const result = await generateWithFallback(prompt);
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
    const result = await generateWithFallback(prompt);
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
