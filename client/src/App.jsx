import { useState } from "react";
import { useRag } from "./context/RagContext";
import { IndexPanel } from "./components/IndexPanel/IndexPanel";
import { ChatFeed } from "./components/ChatFeed/ChatFeed";
import { InputBar } from "./components/InputBar/InputBar";

export default function App() {
  const { session, indexing, chat } = useRag();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-void text-txt overflow-hidden font-sans selection:bg-cyan/20">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Section */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <IndexPanel />
      </aside>

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col min-w-0 bg-base relative">
        {/* Header Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-base/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-overlay rounded-lg text-txt-soft transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${indexing.repo ? "bg-cyan animate-pulse-dot shadow-[0_0_8px_rgba(0,212,170,0.4)]" : "bg-txt-muted"}`}
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-txt-soft uppercase tracking-widest leading-none mb-1">
                  Session ID
                </span>
                <span className="text-[11px] font-bold text-txt/80 font-mono tracking-tight">
                  {session.id.slice(0, 12)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-overlay border border-border rounded-xl p-1 shadow-inner">
              {["semantic", "keyword"].map((m) => (
                <button
                  key={m}
                  onClick={() => chat.setMode(m)}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${chat.mode === m ? "bg-cyan text-void shadow-lg shadow-cyan/20" : "text-txt-muted hover:text-txt"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Messages Feed */}
        <ChatFeed />

        {/* Input Control Area */}
        <InputBar />
      </main>
    </div>
  );
}
