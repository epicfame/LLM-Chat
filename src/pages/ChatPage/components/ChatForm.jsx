import { ChatTextarea } from "@components/ChatTextArea";
import { Paperclip, Send } from "lucide-react";

/**
 * @typedef {Object} ChatFormProps
 * @property {string} prompt
 *   Isi teks prompt saat ini. Dipakai sebagai controlled value untuk textarea.
 * @property {(event: import("react").FormEvent<HTMLFormElement>) => void} handleSubmit
 *   Handler saat form di-submit (klik tombol kirim atau submit dari textarea).
 *   Panggil `event.preventDefault()` di dalamnya agar halaman tidak reload.
 * @property {(event: import("react").ChangeEvent<HTMLTextAreaElement>) => void} handleChange
 *   Handler saat isi textarea berubah, biasanya untuk meng-update state `prompt`.
 * @property {boolean} [isLoading]
 *   Jika `true`, tombol kirim dinonaktifkan selama request sedang berjalan.
 */

/**
 * Form input chat: tombol lampiran (belum aktif), textarea prompt, dan tombol kirim.
 *
 * Tombol lampiran sengaja di-`disabled` dan dibungkus `<span>` yang bisa difokus
 * (`tabIndex={0}`), karena elemen `disabled` tidak memicu event hover/fokus.
 * Dengan begitu tooltip "Attachment coming soon!" tetap bisa muncul.
 *
 * @param {ChatFormProps} props
 * @returns {import("react").ReactElement}
 *
 * @example
 * const [prompt, setPrompt] = useState("");
 * const [isLoading, setIsLoading] = useState(false);
 *
 * <ChatForm
 *   prompt={prompt}
 *   isLoading={isLoading}
 *   handleChange={(e) => setPrompt(e.target.value)}
 *   handleSubmit={(e) => {
 *     e.preventDefault();
 *     sendMessage(prompt);
 *   }}
 * />
 */
export function ChatForm({ prompt, handleSubmit, isLoading, handleChange }) {
  return (
    <form className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-1.5 transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(251,113,133,0.12)]" onSubmit={handleSubmit}>
      <span
        className="relative inline-flex items-center after:pointer-events-none after:invisible after:absolute after:bottom-[calc(100%+10px)] after:left-1/2 after:z-10 after:-translate-x-1/2 after:translate-y-[5px] after:rounded-md after:bg-text after:px-3 after:py-[7px] after:text-xs after:font-semibold after:whitespace-nowrap after:text-white after:opacity-0 after:transition-all after:duration-200 after:content-[attr(data-tooltip)] hover:after:visible hover:after:translate-y-0 hover:after:opacity-100 focus-visible:after:visible focus-visible:after:translate-y-0 focus-visible:after:opacity-100"
        data-tooltip="Attachment coming soon!"
        tabIndex={0}
      >
        <button
          type="button"
          className="flex cursor-not-allowed items-center justify-center rounded-md border-0 bg-transparent p-2 text-text-muted opacity-45"
          disabled
          aria-label="Attachment is not available yet"
        >
          <Paperclip size={20} />
        </button>
      </span>
      <ChatTextarea value={prompt} onChange={handleChange} />

      <button
        type="submit"
        className="flex cursor-pointer items-center justify-center rounded-md border-0 bg-secondary px-2.5 py-1.5 text-white transition-[background,transform] duration-200 hover:bg-[#ea7b27] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading}
      >
        <Send color="white" />
      </button>
    </form>
  );
}
