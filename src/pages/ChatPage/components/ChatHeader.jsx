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
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2.5">
        {!isSidebarOpen && (
          <>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-text transition-colors duration-200"
            >
              <PanelLeft />
            </button>
            <img src={logo} alt="DumbChat" className="block size-[34px] object-contain" />
          </>
        )}
      </div>

      <ModelSelection
        options={["nvidia/nemotron-3-ultra-550b-a55b:free"]}
        value={selectedModel}
        onChange={onModelChange}
      />
    </div>
  );
}
