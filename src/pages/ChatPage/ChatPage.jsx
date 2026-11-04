import { useState, useRef, useEffect } from "react";
import { InputText } from "@components/InputText/InputText";
import { ChatLayout } from "@layouts/ChatLayout/ChatLayout";
import { ChatHeader } from "./components/ChatHeader";
import { Send, Paperclip } from "lucide-react";
import Markdown from "react-markdown";
import { v7 as uuidv7 } from "uuid";
import styles from "./ChatPage.module.css";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBodyRef = useRef(null);

  const handlePromptInput = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
        return;
    }
    setMessages([
      ...messages,
      {
        id: uuidv7(),
        role: "user",
        content: prompt,
      },
    ]);
    // hit to api, better use stream text for showing
    console.log("Input: " + prompt.trim());
    const feedback = {
      id: uuidv7(),
      role: "ai",
      content: "Hi, im still offline try again later",
    };
    setMessages((prev) => [...prev, feedback]);

    setPrompt("");
  };

  //   const callOpenRouter = () => {

  //   }

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
      header={<ChatHeader />}
      footer={
        <form className={styles.formInput} onSubmit={handlePromptInput}>
          <Paperclip />
          <InputText
            placeholder="Type your message here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" className={styles.submitButton}>
            <Send color="white" />
          </button>
        </form>
      }
    >
      <div ref={chatBodyRef} className={styles.chatBody}>
        {messages.map((message) => {
          const style =
            message.role === "user" ? styles.textRight : styles.textLeft;
          return (
            <p key={message.id} className={style}>
              <Markdown>{message.content}</Markdown>
            </p>
          );
        })}
      </div>
    </ChatLayout>
  );
}
