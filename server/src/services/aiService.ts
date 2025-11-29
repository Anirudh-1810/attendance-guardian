// src/services/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function parseTimetableImage(imageBuffer: Buffer, mimeType: string) {
  try {
    // 1. Select the Model (Flash is perfect for high-speed extraction)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 2. The "System Prompt" - This is where the magic happens
    const prompt = `
      You are a strict data extraction engine. You are analyzing a Chitkara University Class Timetable.
      
      **Layout Analysis:**
      - The rows are Days (Mon, Tue, Wed, Thu, Fri).
      - The columns are Periods (usually 1 to 7).
      - Each cell contains 3 pieces of information: 
        1. Subject Code (TOP line, e.g., "CS101")
        2. Teacher/Faculty (MIDDLE line, e.g., "Dr. A")
        3. Room Number (BOTTOM line, e.g., "TG-202")
      
      **Critical Rules:**
      1. **Merged Cells:** If a subject spans multiple columns (e.g., 11:00 to 13:00), output it as a single entry with the correct start and end time.
      2. **Empty Slots:** Ignore empty cells.
      3. **Output Format:** Return ONLY a valid JSON object. Do not write markdown. Do not say "Here is the JSON".
      
      **Target JSON Structure:**
      {
        "timeTable": {
          "Monday": [
            { "subject": "String", "room": "String", "teacher": "String", "startTime": "HH:MM", "endTime": "HH:MM" }
          ],
          "Tuesday": [],
          "Wednesday": [],
          "Thursday": [],
          "Friday": []
        }
      }
    `;

    // 3. Prepare the payload
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    // 4. Fire the request
    console.log("🔮 Consulting the Oracle (Gemini)...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // 5. Clean the output (Gemini sometimes adds ```json fence)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // console.log(cleanedText);
    
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to extract timetable data");
  }
}