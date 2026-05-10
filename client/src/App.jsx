import { useState } from "react";
import { useRag } from "./context/RagContext";
import { useTheme } from "./context/ThemeContext";
import { IndexPanel } from "./components/IndexPanel/IndexPanel";
import { ChatFeed } from "./components/ChatFeed/ChatFeed";
import { InputBar } from "./components/InputBar/InputBar";

export default function App() {
  const { indexing, chat } = useRag();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-base text-txt overflow-hidden font-mono selection:bg-cyan/10">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-txt/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <IndexPanel />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-base relative">
        {/* Header */}
        <header className="h-[56px] border-b border-border flex items-center justify-between px-6 bg-base z-40 sticky top-0 flex-shrink-0 shadow-sm">
          {/* Left — mobile burger + session info */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-surface border border-border rounded-lg text-txt-muted hover:text-cyan transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-700 ${indexing.repo ? "bg-cyan" : "bg-border-bright"}`}
                />
                {indexing.repo && (
                  <div className="absolute inset-0 bg-cyan rounded-full animate-ping opacity-25" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.25em] leading-none mb-1">
                  {chat.summary ? "Conversation Memory" : "Core Session"}
                </span>
                {chat.summary && (
                  <span className="text-[12px] font-mono text-txt-soft/80 tracking-widest truncate max-w-[240px]">
                    {chat.summary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right — theme toggle + wipe chat + mode switch */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface border border-border text-txt-soft hover:text-cyan transition-all"
              title="Toggle Theme"
            >
              {isDark ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {chat.messages.length > 0 && (
              <button
                onClick={chat.clear}
                className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-err-dim border border-err/10 hover:border-err/30 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5 text-err/60 group-hover:text-err transition-colors"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-[10px] font-bold text-err group-hover:text-err uppercase tracking-widest transition-colors opacity-70 group-hover:opacity-100">
                  Wipe Chat
                </span>
              </button>
            )}

            <div className="hidden sm:flex items-center bg-surface border border-border rounded-xl p-1 gap-1">
              {["semantic", "keyword"].map((m) => (
                <button
                  key={m}
                  onClick={() => chat.setMode(m)}
                  className={`px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300
                    ${chat.mode === m ? "bg-txt text-base shadow-lg shadow-txt/5" : "text-txt-muted hover:text-txt hover:bg-txt/5"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <ChatFeed />
        </div>

        {/* Input */}
        <InputBar />
      </main>
    </div>
  );
}
