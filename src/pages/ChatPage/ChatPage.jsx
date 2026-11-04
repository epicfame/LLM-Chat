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
    if (!prompt.trim()) {
      return;
    }
    const userMessage = {
      id: uuidv7(),
      role: "user",
      content: prompt,
    };

    const assistantMessage = {
      id: uuidv7(),
      role: "assistant",
      content: "",
      status: "loading",
    };

    const newMessages = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    // hit to api, better use stream text for showing
    // console.log("Input: " + prompt.trim());

    setPrompt("");
    setIsLoading(true);

    try {
      const result = await callOpenRouter(newMessages);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: result.content, status: "done" }
            : message,
        ),
      );
      console.log("Model:", result.model);
      console.log("Usage:", result.usage);
    } catch (e) {
      console.log("Error calling api: " + e);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: `Maaf, terjadi kesalahan: ${e.message}`,
                status: "error",
              }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const callOpenRouter = async (newMessages) => {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: newMessages,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch AI response");
    }

    return data;
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
          <Paperclip />
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
