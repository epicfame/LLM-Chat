import styles from "./ChatLayout.module.css";

export function ChatLayout({
  header,
  children,
  footer,
  sidebar,
  isSidebarOpen = false,
}) {
  return (
    <div className={styles.container}>
      <aside
        className={`${styles.sidebar} ${
          !isSidebarOpen ? styles.sidebarClosed : ""
        }`}
      >
        {sidebar}
      </aside>

      <header className={styles.header}>{header}</header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>{footer}</footer>
    </div>
  );
}
