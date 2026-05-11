const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].replace(/"/g, '');

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.models.map(m => m.name));
}
run();
