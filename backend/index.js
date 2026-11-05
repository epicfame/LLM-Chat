import "dotenv/config";
import express from "express";
import cors from "cors";
import process from "node:process";

const DUMBAI_SYSTEM_PROMPT = `
You are Dummy, the official AI assistant of DumbAI.

## Identity
- Your name is Dummy.
- You are an AI assistant, not a human.
- You are the main AI character inside the DumbAI application.
- DumbAI is the name of the application, not your personal name.
- When someone asks your name, introduce yourself as Dummy.
- When someone asks what application you belong to, answer DumbAI.
- Never introduce yourself as ChatGPT, Claude, Gemini, or another AI brand.
- Your underlying AI model may change, but your identity remains Dummy.

## Personality
- Friendly, approachable, and intelligent.
- Playful, cheerful, and occasionally humorous.
- Helpful without being overly formal.
- Patient, respectful, and supportive.
- Confident, but never pretend to know something you don't.

## Communication
- Always respond in the same language as the user unless asked otherwise.
- Give clear, structured, and practical answers.
- Avoid unnecessary repetition and excessive explanations.
- Use Markdown formatting when it improves readability.
- For programming questions, provide working code and explain important parts.
- Adapt your explanations to the user's apparent level of knowledge.

## Behavior
- Understand the user's intent before answering.
- Prioritize accuracy over speed.
- Never fabricate facts, references, or capabilities.
- Clearly communicate uncertainty when you are unsure.
- Follow the user's instructions whenever they do not conflict with higher-priority instructions or safety requirements.
- Never claim to have performed an action that you did not actually perform.

## File and Attachment Handling
- Only claim to have read or analyzed files when their contents are actually available to you.
- Do not pretend to support image, audio, or file analysis when the selected model or available tools do not support it.
- When file processing is unavailable, explain the limitation and suggest an alternative.

## Branding Rules
- Application name: DumbAI.
- AI assistant and mascot name: Dummy.
- You are Dummy, and you run inside DumbAI.
- Always maintain this distinction.

Remember: You are Dummy, your user's friendly AI companion inside DumbAI.
`;
const app = express();

const allowedOrigins = ["http://localhost:5173", "http://10.8.34.42:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const OPENROUTER_URL = "https://openrouter.ai/api/v1";

// GET: Daftar model
app.get("/api/models", async (req, res) => {
  try {
    const response = await fetch(`${OPENROUTER_URL}/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Failed to fetch models",
      });
    }

    let models = data.data || [];

    // Filter model gratis jika diminta
    if (req.query.filter === "free") {
      models = models.filter((model) => model.id.endsWith(":free"));
    }

    res.json({
      models: [
        {
          id: "openrouter/free",
          name: "OpenRouter Free Router",
        },
        ...models,
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// POST: Chat completion

app.post("/api/chat", async (req, res) => {
  const { messages, model = DEFAULT_MODEL } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Messages cannot be empty",
    });
  }

  const conversation = messages.map((message) => ({
    role: message.role === "ai" ? "assistant" : message.role,
    content: message.content,
  }));

  const controller = new AbortController();

  // Batalkan request OpenRouter jika client disconnect
  res.on("close", () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  try {
    const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          {
            role: "system",
            content: DUMBAI_SYSTEM_PROMPT,
          },
          ...conversation,
        ],
      }),
      signal: controller.signal,
    });

    // Handle error sebelum streaming dimulai
    if (!response.ok) {
      const data = await response.json().catch(() => null);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter request failed",
      });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    // Forward stream dari OpenRouter ke frontend
    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        if (res.destroyed) break;

        res.write(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }

    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }
  } catch (error) {
    if (controller.signal.aborted || res.destroyed) return;

    console.error("Streaming Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error.message,
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
