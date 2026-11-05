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
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          !isSidebarOpen ? styles.sidebarClosed : ""
        }`}
        aria-hidden={!isSidebarOpen}
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className={styles.content}>
        <header className={styles.header}>{header}</header>

        <main className={styles.main}>{children}</main>

        <footer className={styles.footer}>{footer}</footer>
      </div>
    </div>
  );
}
