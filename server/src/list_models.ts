// server/src/list_models.ts
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function checkModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("❌ No API Key found in .env");
    return;
  }
  console.log("🔑 Using API Key starting with:", key.substring(0, 5) + "...");

  try {
    // We use a simple fetch because the SDK's listModels can be hidden
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("\n✅ AVAILABLE MODELS FOR YOU:");
    const models = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"));
    
    models.forEach((m: any) => {
      console.log(`   - ${m.name.replace("models/", "")}`);
    });

  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

checkModels();