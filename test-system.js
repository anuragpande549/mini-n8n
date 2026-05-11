const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].replace(/"/g, '');
const genAI = new GoogleGenerativeAI(key);

async function run() {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a friendly bot.",
  });
  try {
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}
run();
