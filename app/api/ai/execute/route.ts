import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to replace template variables
function replaceTemplateVariables(text: string, input: any): string {
  if (!text || typeof text !== "string") return text;

  // Replace {{ input }} with the whole input
  let result = text.replace(
    /\{\{\s*input\s*\}\}/gi,
    typeof input === "object" ? JSON.stringify(input) : String(input)
  );

  // Replace {{ input.field }} or {{input.nested.field}} with specific fields
  result = result.replace(
    /\{\{\s*input\.([^}]+?)\s*\}\}/gi,
    (match: string, path: string) => {
      const fields = path.trim().split(".");
      let value = input;

      for (const field of fields) {
        if (value && typeof value === "object" && field in value) {
          value = value[field];
        } else {
          return match; // Keep original if path doesn't exist
        }
      }

      return typeof value === "object" ? JSON.stringify(value) : String(value);
    }
  );

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { type, config, input } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Google Gemini credentials not configured. Add GEMINI_API_KEY to .env",
        },
        { status: 500 }
      );
    }

    // Initialize Gemini client inside the handler
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = "gemini-2.5-flash-lite"; // Default model that works widely

    let result;

    switch (type) {
      case "aiTextGenerator":
        result = await executeTextGenerator(
          config,
          input,
          genAI,
          modelName
        );
        break;

      case "aiAnalyzer":
        result = await executeAnalyzer(config, input, genAI, modelName);
        break;

      case "aiChatbot":
        result = await executeChatbot(config, input, genAI, modelName);
        break;

      case "aiDataExtractor":
        result = await executeDataExtractor(
          config,
          input,
          genAI,
          modelName
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown AI node type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI execution error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response,
    });
    return NextResponse.json(
      {
        error: error.message || "AI execution failed",
        details: error.status ? `Status: ${error.status}` : undefined,
      },
      { status: 500 }
    );
  }
}

async function executeTextGenerator(
  config: any,
  input: any,
  genAI: GoogleGenerativeAI,
  modelName: string
) {
  let { prompt, temperature, maxTokens } = config;

  // Replace template variables in prompt
  prompt = replaceTemplateVariables(prompt, input);

  if (!prompt?.trim()) {
    return {
      generatedText: "",
      model: modelName,
      usage: {},
      error: "Prompt is empty after processing template variables.",
    };
  }

  console.log("Executing text generator with:", {
    modelName,
    prompt: prompt?.substring(0, 50),
  });

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: parseFloat(temperature) || 0.7,
      maxOutputTokens: parseInt(maxTokens) || 500,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;

  console.log("Text generator completed:", { model: modelName });

  return {
    generatedText: response.text(),
    model: modelName,
    usage: response.usageMetadata,
  };
}

async function executeAnalyzer(
  config: any,
  input: any,
  genAI: GoogleGenerativeAI,
  modelName: string
) {
  let { text, analysisType } = config;

  // Process template variables in text
  text = replaceTemplateVariables(text, input);

  if (!text?.trim()) {
    return {
      analysisType,
      result: "",
      usage: {},
      error: "Text is empty after processing template variables.",
    };
  }

  let systemPrompt = "";
  switch (analysisType) {
    case "sentiment":
      systemPrompt =
        "Analyze the sentiment of the following text. Respond with: Positive, Negative, or Neutral, followed by a confidence score (0-1) and brief explanation.";
      break;
    case "keywords":
      systemPrompt =
        "Extract the most important keywords and phrases from the following text. Return them as a JSON array.";
      break;
    case "summary":
      systemPrompt =
        "Provide a concise summary of the following text in 2-3 sentences.";
      break;
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(text);
  const response = await result.response;

  return {
    analysisType,
    result: response.text(),
    usage: response.usageMetadata,
  };
}

async function executeChatbot(
  config: any,
  input: any,
  genAI: GoogleGenerativeAI,
  modelName: string
) {
  let { systemPrompt, userMessage, personality } = config;

  // Process template variables
  systemPrompt = replaceTemplateVariables(systemPrompt, input);
  userMessage = replaceTemplateVariables(userMessage, input);

  if (!userMessage?.trim()) {
    return {
      response: "",
      personality,
      usage: {},
      error: "User message is empty after processing template variables.",
    };
  }

  const personalityPrompts = {
    professional: "Respond in a professional and formal manner.",
    friendly: "Respond in a warm, friendly, and conversational manner.",
    concise: "Respond with brief, to-the-point answers.",
  };

  const fullSystemPrompt = `${systemPrompt || ""}\n\n${personalityPrompts[personality as keyof typeof personalityPrompts] || ""
    }`.trim();

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: fullSystemPrompt,
    generationConfig: {
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(userMessage);
  const response = await result.response;

  return {
    response: response.text(),
    personality,
    usage: response.usageMetadata,
  };
}

async function executeDataExtractor(
  config: any,
  input: any,
  genAI: GoogleGenerativeAI,
  modelName: string
) {
  let { text, schema } = config;

  // Process template variables
  text = replaceTemplateVariables(text, input);
  schema = replaceTemplateVariables(schema, input);

  if (!text?.trim()) {
    return {
      extractedData: {},
      schema,
      usage: {},
      error: "Text is empty after processing template variables.",
    };
  }

  const systemPrompt = `Extract information from the text according to this schema: ${schema}. Return ONLY a valid JSON object matching the schema, with no additional text or explanation.`;

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(text);
  const response = await result.response;
  const extractedData = response.text();

  try {
    const parsed = JSON.parse(extractedData || "{}");
    return {
      extractedData: parsed,
      schema,
      usage: response.usageMetadata,
    };
  } catch (e) {
    return {
      extractedData: extractedData,
      schema,
      usage: response.usageMetadata,
      note: "Could not parse as JSON, returning raw text",
    };
  }
}
