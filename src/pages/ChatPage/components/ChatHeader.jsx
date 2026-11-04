import logo from "@assets/react.svg";
import { ModelSelection } from "./ModelSelection";
import styles from "./ChatHeader.module.css";

export function ChatHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoHeader}>
        <img src={logo} />
        <h2 className={styles.title}>AI Chat</h2>
      </div>
      <ModelSelection options={['Claude', 'Deepseek']}/>
    </div>
  );
}