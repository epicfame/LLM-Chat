import "dotenv/config";
import express from "express";
import cors from "cors";
import process from "node:process";

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
            content:
              "You are a helpful AI assistant. Reply using the user's language.",
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
