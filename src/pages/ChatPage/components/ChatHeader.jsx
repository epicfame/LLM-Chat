import { ModelSelection } from "./ModelSelection";
import logo from "@assets/logo/logo-dumbai.gif";
import { PanelLeft } from "lucide-react";

export function ChatHeader({
  selectedModel,
  onModelChange,
  onToggleSidebar,
  isSidebarOpen,
}) {
  return (
    <div className="flex items-center justify-between gap-2 p-1 sm:p-2">
      <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
          <div className={`flex items-center gap-1 sm:gap-2.5 ${isSidebarOpen ? "invisible" : ""}`}>
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Open sidebar"
              aria-controls="chat-sidebar"
              aria-expanded={isSidebarOpen}
              className="flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-text transition-colors duration-200"
            >
              <PanelLeft />
            </button>
            <img src={logo} alt="DumbChat" className="hidden size-[34px] sm:block object-contain" />
          </div>
      </div>

      <ModelSelection
        options={["nvidia/nemotron-3-ultra-550b-a55b:free"]}
        value={selectedModel}
        onChange={onModelChange}
      />
    </div>
  );
}
