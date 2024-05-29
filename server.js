import express from "express";
import ViteExpress from "vite-express";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// eslint-disable-next-line no-undef
const geminiApiKey = process.env["GEMINI_API_KEY"];
const genAI = new GoogleGenerativeAI(geminiApiKey);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

app.get("/message", (_, res) => res.send("Hello from express!"));

app.post("/api/generateResponseToText", async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: safetySettings,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    handleSafetyError(error, res);
  }
});

app.post("/api/flashGenerateResponseToTextAndImage", async (req, res) => {
  const { prompt, imageData, mimeType } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: safetySettings,
    });

    const result = await model.generateContent(
      [prompt, { inlineData: { data: imageData, mimeType: mimeType } }]
    );

    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    handleSafetyError(error, res);
  }
});

app.post("/api/proGenerateResponseToTextAndImage", async (req, res) => {
  const { prompt, imageData, mimeType } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      safetySettings: safetySettings,
    });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: mimeType } },
    ]);
    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    handleSafetyError(error, res);
  }
});

function handleSafetyError(error, res) {
  console.error("Error generating response:", error);

  if (error.response) {
    const response = error.response;
    const promptFeedback = response.promptFeedback;
    const candidates = response.candidates;

    if (promptFeedback && promptFeedback.blockReason) {
      console.error("Prompt was blocked:", promptFeedback.blockReason);
      res.status(400).json({ error: "Prompt was blocked due to safety reasons" });
    } else if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      const finishReason = candidate.finishReason;
      const safetyRatings = candidate.safetyRatings;

      if (finishReason === "SAFETY") {
        console.error("Response was blocked due to safety ratings:", safetyRatings);
        res.status(400).json({ error: "Response was blocked due to safety reasons" });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  } else {
    res.status(500).json({ error: error.message });
  }
}

// eslint-disable-next-line no-undef
const port = process.env.NODE_ENV === "production" ? 8080 : 3000;

ViteExpress.listen(app, port, () => console.log("Server is listening..."));