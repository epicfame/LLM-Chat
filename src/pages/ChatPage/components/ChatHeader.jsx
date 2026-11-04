import logo from "@assets/logo/logo-dumbai-horizontal.svg";
import { ModelSelection } from "./ModelSelection";
import styles from "./ChatHeader.module.css";

export function ChatHeader({ selectedModel, onModelChange }) {
  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        <img src={logo} alt="DumbChat" className={styles.logo} />
      </div>

      <ModelSelection
        options={["nvidia/nemotron-3-ultra-550b-a55b:free"]}
        value={selectedModel}
        onChange={onModelChange}
      />
    </div>
  );
}
