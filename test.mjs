import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", // Testing the user's model
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });

    console.log("Generating content...");
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (err) {
    console.error("Error executing:", err);
  }
}

test();
