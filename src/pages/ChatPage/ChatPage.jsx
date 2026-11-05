import { useState, useRef, useEffect } from "react";
import { ChatLayout } from "@layouts/ChatLayout/ChatLayout";
import { Sidebar } from "@components/Sidebar/Sidebar";
import { ChatForm } from "./components/ChatForm";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessage } from "./components/ChatMessage";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ChatHistory } from "./components/ChatHistory"; // [history]
import { useChatSessions } from "./hooks/useChatSessions"; // [history]
import styles from "./ChatPage.module.css";
import { v7 as uuidv7 } from "uuid";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState(
    "nvidia/nemotron-3-ultra-550b-a55b:free",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // [history] Sessions live beside `messages`; switching is blocked while a reply is streaming
  const {
    sessions,
    activeSessionId,
    startSession,
    selectSession,
    newChat,
    deleteSession,
  } = useChatSessions({ messages, setMessages, isBusy: isLoading });

  const chatBodyRef = useRef(null);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = prompt.trim();

    if (!content || isLoading) return;

    // [history] First message of a new chat creates its session (title = this prompt)
    startSession(content);

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
  };

  const handleInput = (e) => {
    setPrompt(e.target.value);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChatLayout
      header={
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={handleSelectModel}
          onToggleSidebar={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
        />
      }
      footer={
        <ChatForm
          isLoading={isLoading}
          handleChange={handleInput}
          handleSubmit={handleSubmit}
          prompt={prompt}
        />
      }
      sidebar={
        <Sidebar onClosed={handleSidebarToggle}>
          {/* [history] */}
          <ChatHistory
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelect={selectSession}
            onNew={newChat}
            onDelete={deleteSession}
            disabled={isLoading}
          />
        </Sidebar>
      }
      isSidebarOpen={isSidebarOpen}
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
