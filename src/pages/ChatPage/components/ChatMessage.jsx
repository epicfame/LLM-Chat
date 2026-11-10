import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

import mascotThinking from "@assets/images/mascot-thinking.svg";

function MarkdownCodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const codeElement = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === "code",
  );

  if (!codeElement) {
    return <pre className="my-3 max-w-full overflow-x-auto rounded-md border border-border bg-text p-3.5 text-surface">{children}</pre>;
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
    <div className="my-3.5 overflow-hidden rounded-md border border-border bg-[#263238]">
      <div className="flex items-center justify-between gap-2 bg-[#1e293b] px-3.5 py-[9px] text-xs font-semibold text-[#d1d5db]">
        <span className="min-w-0 truncate">{language}</span>

        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm border border-transparent bg-transparent px-2 py-[5px] text-[#d1d5db] transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={handleCopy}
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>

      <pre className="m-0 overflow-x-auto rounded-none border-0 bg-[#263238] p-3.5 text-[#f8fafc]">
        <code className={`font-[Fira_Code,monospace]! text-[13px] leading-[1.7] whitespace-pre ${codeElement.props.className ?? ""}`}>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownTable({ children }) {
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain" tabIndex={0} role="region" aria-label="Scrollable table">
      <table>{children}</table>
    </div>
  );
}

export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const style = isUser ? "block min-w-0 shrink-0 w-fit max-w-[min(400px,85%)] self-end rounded-lg rounded-br-sm border border-primary bg-primary px-2.5 py-1.5 wrap-anywhere text-white not-last:mb-3" : "block min-w-0 shrink-0 w-full max-w-[800px] self-start rounded-md border border-border border-l-4 border-l-mint bg-surface px-3 py-3 sm:px-4 leading-[1.7] wrap-anywhere text-text first:mt-0 not-last:mb-3 [&_p]:mb-3 [&_p]:leading-[1.7] [&_p:last-child]:mb-0 [&_:is(h1,h2,h3)]:mt-5 [&_:is(h1,h2,h3)]:mb-2.5 [&_:is(h1,h2,h3)]:font-bold [&_:is(h1,h2,h3)]:leading-[1.4] [&_:is(h1,h2,h3)]:text-text [&_strong]:text-primary [&_a]:text-primary [&_a]:underline [&_a]:wrap-anywhere [&_:is(ul,ol)]:my-2.5 [&_:is(ul,ol)]:pl-6 [&_li]:my-[5px] [&_li]:leading-[1.6] [&_table]:my-4 [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:text-sm [&_table]:leading-[1.6] [&_thead]:bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))] [&_:is(th,td)]:border [&_:is(th,td)]:border-border [&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2.5 [&_:is(th,td)]:text-left [&_:is(th,td)]:align-top [&_:is(th,td)]:text-text [&_th]:font-bold [&_tbody_tr:nth-child(even)]:bg-[color-mix(in_srgb,var(--color-background)_65%,var(--color-surface))] [&_pre]:max-w-full [&_code]:font-[monospace] [&_pre_code]:text-inherit [&_blockquote]:my-3 [&_blockquote]:rounded-r-sm [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary [&_blockquote]:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-surface))] [&_blockquote]:px-3.5 [&_blockquote]:py-2.5 [&_hr]:my-5 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border";

  // Loading: tiga titik
  if (message.status === "loading") {
    return (
      <div className={style}>
        <div className="flex items-center gap-[5px] px-0.5 py-2 [&_span]:size-[7px] [&_span]:animate-typing [&_span]:rounded-full [&_span]:bg-secondary [&_span:nth-child(2)]:[animation-delay:0.2s] [&_span:nth-child(3)]:[animation-delay:0.4s] motion-reduce:[&_span]:animate-none">
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
        <div className="flex items-center gap-3 font-semibold text-text-muted">
          <img
            src={mascotThinking}
            alt="Sunny is thinking"
            className="size-16 shrink-0 animate-mascot-bounce object-contain motion-reduce:animate-none"
          />
          <span>Sunny is thinking...</span>
        </div>
      </div>
    );
  }

  // Streaming / Done / Error
  return (
    <div className={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: MarkdownCodeBlock, table: MarkdownTable }}>
        {message.content}
      </ReactMarkdown>

      {message.status === "streaming" && (
        <span className="ml-[3px] inline-block h-[17px] w-0.5 animate-cursor-blink bg-secondary align-middle motion-reduce:animate-none" />
      )}
    </div>
  );
}
