import { useEffect, useRef } from "react";
import styles from "./ChatTextarea.module.css";

export function ChatTextarea({ value, onChange, ...props }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    // Enter untuk submit, Shift + Enter untuk newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={styles.textarea}
      rows={1}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder="Type your message here..."
    />
  );
}