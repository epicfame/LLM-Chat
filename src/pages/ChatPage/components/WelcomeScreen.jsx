import styles from "./WelcomeScreen.module.css";
import mascotHello from "@assets/images/mascot-hello.svg";

export function WelcomeScreen() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.mascotWrapper}>
        <img src={mascotHello} alt="Chat mascot" className={styles.mascot} />
      </div>

      <div className={styles.welcomeContent}>
        <p>
          Ask me anything. I'm here to help you explore ideas, solve problems,
          and learn something new.
        </p>
      </div>
    </div>
  );
}
