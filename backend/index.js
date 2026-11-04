import "dotenv/config";
import express from "express";
import cors from "cors";
import process from "node:process";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://10.8.34.42:5173",
];

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
  try {
    const { messages, model = DEFAULT_MODEL } = req.body;
    console.log(messages, model);

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages cannot be empty",
      });
    }

    const conversation = messages.map((message) => ({
      role: message.role === "ai" ? "assistant" : message.role,
      content: message.content,
    }));

    const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant. Reply using the user's language.",
          },
          ...conversation,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter request failed",
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    res.json({
      model: data.model,
      content: answer,
      usage: data.usage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
