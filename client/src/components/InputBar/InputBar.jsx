import { useState } from "react";
import { useRag } from "../../context/RagContext";

export function InputBar() {
  const { chat, indexing } = useRag();
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || chat.isAsking) return;
    chat.ask(input.trim());
    setInput("");
  };

  return (
    <div className="px-4 pb-6 pt-2 bg-gradient-to-t from-void via-void/95 to-transparent z-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <form onSubmit={handleSend} className="relative group">
          <textarea
            rows={1}
            placeholder={indexing.repo ? "Ask about the codebase..." : "Index a repository to start"}
            disabled={!indexing.repo || chat.isAsking}
            className="w-full bg-overlay border border-border text-txt rounded-2xl px-5 py-4 pr-16 text-[15px] focus:border-cyan/40 focus:ring-2 focus:ring-cyan/10 outline-none transition-all resize-none shadow-2xl disabled:opacity-30 placeholder:text-txt-muted leading-relaxed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend(e);
            }}
          />
          <button 
            type="submit"
            disabled={!indexing.repo || !input.trim() || chat.isAsking}
            className="absolute right-3.5 top-3.5 p-2.5 rounded-xl bg-cyan text-void disabled:opacity-0 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan/20"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925L10.788 10l-7.095 1.836-1.414 4.925a.75.75 0 00.826.95 44.896 44.896 0 0012.845-7.425.75.75 0 000-1.212A44.896 44.896 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] text-txt-muted font-mono opacity-50 uppercase tracking-widest hidden sm:block">
            Enter to send • Shift+Enter for new line
          </p>
          <div className="sm:hidden flex bg-overlay border border-border rounded-lg p-0.5 scale-90">
            {["semantic", "keyword"].map((m) => (
              <button 
                key={m}
                onClick={() => chat.setMode(m)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md ${chat.mode === m ? "bg-cyan text-void" : "text-txt-muted"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
