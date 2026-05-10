import { useState } from "react";
import { useRag } from "./context/RagContext";
import { IndexPanel } from "./components/IndexPanel/IndexPanel";
import { ChatFeed } from "./components/ChatFeed/ChatFeed";

export default function App() {
  const { session, indexing, chat } = useRag();
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || chat.isAsking) return;
    chat.ask(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-screen w-screen bg-void text-txt overflow-hidden font-sans selection:bg-cyan/20">
      {/* Sidebar Section */}
      <IndexPanel />

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col min-w-0 bg-base relative">
        {/* Header Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-base/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${indexing.repo ? "bg-cyan animate-pulse-dot" : "bg-txt-muted"}`}
            />
            <span className="text-[10px] font-mono text-txt-soft uppercase tracking-widest">
              Session: {session.id.slice(0, 8)}...
            </span>
          </div>

          <div className="flex bg-overlay border border-border rounded-lg p-0.5">
            {["semantic", "keyword"].map((m) => (
              <button
                key={m}
                onClick={() => chat.setMode(m)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${chat.mode === m ? "bg-cyan text-void shadow-lg shadow-cyan/20" : "text-txt-muted hover:text-txt"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </header>

        {/* Messages Feed */}
        <ChatFeed />

        {/* Input Control Area */}
        <div className="p-4 bg-gradient-to-t from-void via-void/80 to-transparent pt-10">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative group"
          >
            <textarea
              rows={1}
              placeholder={
                indexing.repo
                  ? "Ask about the codebase..."
                  : "Index a repository to start"
              }
              disabled={!indexing.repo || chat.isAsking}
              className="w-full bg-overlay border border-border text-txt rounded-2xl px-5 py-3.5 pr-14 text-[14px] focus:border-cyan/40 focus:ring-1 focus:ring-cyan/40 outline-none transition-all resize-none shadow-2xl disabled:opacity-30 placeholder:text-txt-muted"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend(e);
              }}
            />
            <button
              type="submit"
              disabled={!indexing.repo || !input.trim() || chat.isAsking}
              className="absolute right-3 top-3 p-2 rounded-xl bg-cyan text-void disabled:opacity-0 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan/20"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925L10.788 10l-7.095 1.836-1.414 4.925a.75.75 0 00.826.95 44.896 44.896 0 0012.845-7.425.75.75 0 000-1.212A44.896 44.896 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-center text-txt-muted mt-3 font-mono opacity-50 uppercase tracking-widest">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
