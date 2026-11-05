import { ChatTextarea } from "@components/ChatTextarea/ChatTextarea";
import { Paperclip, Send } from "lucide-react";
import styles from "./ChatForm.module.css";

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
    <form className={styles.formInput} onSubmit={handleSubmit}>
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
      <ChatTextarea value={prompt} onChange={handleChange} />

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        <Send color="white" />
      </button>
    </form>
  );
}
