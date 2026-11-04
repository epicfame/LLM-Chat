import styles from "./ChatLayout.module.css";

export function ChatLayout({ header, children, footer }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>{header}</header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.header}>{footer}</footer>
    </div>
  );
}
