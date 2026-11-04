import Markdown from "react-markdown";
import mascotThinking from "@assets/images/mascot-thinking.svg";
import styles from "./ChatMessage.module.css";

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
      <Markdown>{message.content}</Markdown>

      {message.status === "streaming" && (
        <span className={styles.streamingCursor} />
      )}
    </div>
  );
}