import { X } from "lucide-react";
import logo from "@assets/logo/logo-dumbai-horizontal.svg";

export function Sidebar({ onClosed, children }) {
  return (
    <aside className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <img src={logo} alt="DumbAI" className="block h-auto max-h-12 w-40 max-w-full object-contain" />

        <button
          type="button"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted transition-colors duration-200 hover:bg-surface hover:text-text"
          onClick={onClosed}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>

      <div className="shrink-0 p-4 text-xs text-text-muted">
        <p>Do at your own risk</p>
      </div>
    </aside>
  );
}
