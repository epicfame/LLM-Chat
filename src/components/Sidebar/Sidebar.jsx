import { X } from "lucide-react";
import logo from "@assets/logo/logo-dumbai-horizontal.svg";
import styles from "./Sidebar.module.css";

export function Sidebar({ onClosed, children }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <img src={logo} alt="DumbAI" className={styles.logo} />

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClosed}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className={styles.content}>{children}</div>

      <div className={styles.footer}>
        <p>Do at your own risk</p>
      </div>
    </aside>
  );
}
