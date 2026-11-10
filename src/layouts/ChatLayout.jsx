export function ChatLayout({
  header,
  children,
  footer,
  sidebar,
  isSidebarOpen = false,
}) {
  return (
    <div className="box-border flex h-dvh w-full flex-row overflow-hidden p-3">
      {/* Sidebar */}
      <aside
        className={`min-w-0 shrink-0 grow-0 overflow-hidden transition-[flex-basis,width,opacity] duration-300 ease-in-out ${
          !isSidebarOpen ? "pointer-events-none w-0 basis-0 opacity-0" : "w-[260px] basis-[260px] opacity-100"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="mx-auto w-full max-w-[900px] shrink-0">{header}</header>

        <main className="mx-auto flex w-full max-w-[900px] min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

        <footer className="mx-auto w-full max-w-[900px] shrink-0">{footer}</footer>
      </div>
    </div>
  );
}
