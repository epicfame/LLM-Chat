import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

import mascotThinking from "@assets/images/mascot-thinking.svg";
import styles from "./ChatMessage.module.css";

function MarkdownCodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const codeElement = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === "code",
  );

  if (!codeElement) {
    return <pre>{children}</pre>;
  }

  const code = React.Children.toArray(codeElement.props.children).join("");

  const language =
    codeElement.props.className?.replace("language-", "") || "code";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span>{language}</span>

        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>

      <pre>
        <code className={codeElement.props.className}>{code}</code>
      </pre>
    </div>
  );
}

export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const style = isUser ? styles.textRight : styles.textLeft;

  // Loading: tiga titik
  if (message.status === "loading") {
    return (
      <div className={style}>
        <div className={styles.typingIndicator}>
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  // Thinking: tampilkan mascot setelah 5 detik
  if (message.status === "thinking") {
    return (
      <div className={style}>
        <div className={styles.thinkingState}>
          <img
            src={mascotThinking}
            alt="Sunny is thinking"
            className={styles.thinkingMascot}
          />
          <span>Sunny is thinking...</span>
        </div>
      </div>
    );
  }

  // Streaming / Done / Error
  return (
    <div className={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: MarkdownCodeBlock }}>
        {message.content}
      </ReactMarkdown>

      {message.status === "streaming" && (
        <span className={styles.streamingCursor} />
      )}
    </div>
  );
}
