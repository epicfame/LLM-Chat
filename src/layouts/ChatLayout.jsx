import { useEffect, useRef } from "react";

export function ChatLayout({
  header,
  children,
  footer,
  sidebar,
  isSidebarOpen = false,
  isMobile = false,
  onSidebarClose,
}) {
  const sidebarRef = useRef(null);
  const modalOpen = isMobile && isSidebarOpen;

  useEffect(() => {
    if (!modalOpen) return;
    const previousFocus = document.activeElement;
    const panel = sidebarRef.current;
    const focusable = () => Array.from(panel.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
    ));
    (focusable()[0] ?? panel).focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSidebarClose();
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0] ?? panel;
      const last = elements.at(-1) ?? panel;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", handleKeyDown);
    return () => {
      panel.removeEventListener("keydown", handleKeyDown);
      const returnFocus = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus
        : document.querySelector('button[aria-controls="chat-sidebar"]');
      returnFocus?.focus();
    };
  }, [modalOpen, onSidebarClose]);

  return (
    <div className="box-border flex h-dvh w-full flex-row overflow-hidden p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-3">
      {modalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onSidebarClose}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <aside
        id="chat-sidebar"
        ref={sidebarRef}
        role={modalOpen ? "dialog" : undefined}
        aria-modal={modalOpen || undefined}
        aria-label="Chat sidebar"
        tabIndex={-1}
        inert={!isSidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 w-[min(300px,calc(100vw-48px))] min-w-0 shrink-0 grow-0 overflow-hidden bg-background shadow-xl transition-[transform,flex-basis,width,opacity] duration-300 ease-in-out motion-reduce:transition-none md:static md:shadow-none ${
          !isSidebarOpen ? "pointer-events-none -translate-x-full opacity-0 md:w-0 md:basis-0 md:translate-x-0" : "translate-x-0 opacity-100 md:w-[260px] md:basis-[260px]"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col" inert={modalOpen}>
        <header className="mx-auto w-full max-w-[900px] shrink-0">{header}</header>

        <main className="mx-auto flex w-full max-w-[900px] min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

        <footer className="mx-auto w-full max-w-[900px] shrink-0">{footer}</footer>
      </div>
    </div>
  );
}
