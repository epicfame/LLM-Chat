import { useEffect, useRef } from "react";

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
      className="box-border max-h-40 min-h-10 w-full min-w-0 resize-none overflow-y-auto border-0 p-2 leading-normal outline-none"
      rows={1}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder="Type your message here..."
    />
  );
}