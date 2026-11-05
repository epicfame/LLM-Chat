import { ModelSelection } from "./ModelSelection";
import logo from "@assets/logo/logo-dumbai.gif";
import { PanelLeft } from "lucide-react";
import styles from "./ChatHeader.module.css";

export function ChatHeader({
  selectedModel,
  onModelChange,
  onToggleSidebar,
  isSidebarOpen,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        {!isSidebarOpen && (
          <>
            <button
              type="button"
              onClick={onToggleSidebar}
              className={styles.toggleButton}
            >
              <PanelLeft />
            </button>
            <img src={logo} alt="DumbChat" className={styles.logo} />
          </>
        )}
      </div>

      <ModelSelection
        options={["nvidia/nemotron-3-ultra-550b-a55b:free"]}
        value={selectedModel}
        onChange={onModelChange}
      />
    </div>
  );
}
