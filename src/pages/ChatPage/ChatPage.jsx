import { useState, useRef, useEffect } from "react";
import { ChatTextarea } from "@components/ChatTextarea/ChatTextarea";
import { ChatLayout } from "@layouts/ChatLayout/ChatLayout";
import { ChatHeader } from "./components/ChatHeader";
import { Send, Paperclip } from "lucide-react";
import { v7 as uuidv7 } from "uuid";
import styles from "./ChatPage.module.css";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ChatMessage } from "./components/ChatMessage";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState(
    "nvidia/nemotron-3-ultra-550b-a55b:free",
  );
  const [isLoading, setIsLoading] = useState(false);

  const chatBodyRef = useRef(null);

  const handlePromptInput = async (e) => {
    e.preventDefault();

    const content = prompt.trim();

    if (!content || isLoading) return;

    const userMessage = {
      id: uuidv7(),
      role: "user",
      content,
    };

    const assistantMessage = {
      id: uuidv7(),
      role: "assistant",
      content: "",
      status: "loading",
    };

    // Conversation history untuk dikirim ke API
    const newMessages = [...messages, userMessage];

    // Tampilkan user message dan assistant placeholder
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    setPrompt("");
    setIsLoading(true);

    // Jika belum ada token selama 5 detik, tampilkan Sunny
    const thinkingTimer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id && message.status === "loading"
            ? { ...message, status: "thinking" }
            : message,
        ),
      );
    }, 5000);

    try {
      const result = await callOpenRouter(newMessages, assistantMessage.id);

      // Ubah status menjadi selesai
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: result.content,
                status: "done",
              }
            : message,
        ),
      );

      console.log("Model:", result.model);
      console.log("Usage:", result.usage);
    } catch (error) {
      console.error("OpenRouter Error:", error);

      // Pertahankan teks yang sudah diterima jika stream terputus
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: message.content
                  ? `${message.content}\n\n> Stream interrupted: ${error.message}`
                  : `Maaf, terjadi kesalahan: ${error.message}`,
                status: "error",
              }
            : message,
        ),
      );
    } finally {
      clearTimeout(thinkingTimer);
      setIsLoading(false);
    }
  };

  const callOpenRouter = async (newMessages, assistantId) => {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: newMessages.map(({ role, content }) => ({
          role,
          content,
        })),
      }),
    });

    // Handle HTTP error sebelum stream dimulai
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to fetch AI response");
    }

    if (!response.body) {
      throw new Error("Streaming response is unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let fullContent = "";
    let model = selectedModel;
    let usage = null;
    let receivedDone = false;

    // Memproses setiap baris SSE
    const processLine = (line) => {
      line = line.trim();

      // Abaikan baris kosong dan SSE comments
      if (!line || line.startsWith(":") || !line.startsWith("data:")) {
        return;
      }

      const payload = line.slice(5).trim();

      // Penanda akhir stream
      if (payload === "[DONE]") {
        receivedDone = true;
        return;
      }

      const chunk = JSON.parse(payload);

      // Error yang terjadi ketika stream sedang berjalan
      if (chunk.error) {
        throw new Error(chunk.error.message || "Streaming failed");
      }

      model = chunk.model || model;
      usage = chunk.usage || usage;

      const token = chunk.choices?.[0]?.delta?.content;

      if (typeof token === "string" && token.length > 0) {
        fullContent += token;

        // Update bubble assistant yang sama
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: fullContent,
                  status: "streaming",
                }
              : message,
          ),
        );
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split(/\r?\n/);

        // Simpan bagian yang belum lengkap
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          processLine(line);
        }
      }

      // Flush decoder dan proses sisa buffer
      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!receivedDone) {
        throw new Error("Streaming ended unexpectedly.");
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      model,
      usage,
    };
  };

  const handleSelectModel = (e) => {
    setSelectedModel(e.target.value);

    console.log("Selected model:", e.target.value);
  };
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behaviour: "smooth",
      });
    }
  }, [messages]);

  return (
    <ChatLayout
      header={
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={handleSelectModel}
        />
      }
      footer={
        <form className={styles.formInput} onSubmit={handlePromptInput}>
          <span
            className={styles.tooltipWrapper}
            data-tooltip="Attachment coming soon!"
            tabIndex={0}
          >
            <button
              type="button"
              className={styles.iconButton}
              disabled
              aria-label="Attachment is not available yet"
            >
              <Paperclip size={20} />
            </button>
          </span>
          <ChatTextarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            <Send color="white" />
          </button>
        </form>
      }
    >
      <div ref={chatBodyRef} className={styles.chatBody}>
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          messages.map((message) => {
            return <ChatMessage key={message.id} message={message} />;
          })
        )}
      </div>
    </ChatLayout>
  );
}
