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
    <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-void via-void/98 to-transparent z-20 relative">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        
        {/* Command Input Area */}
        <form onSubmit={handleSend} className="relative group flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              rows={1}
              placeholder={indexing.repo ? "Ask the codebase a question..." : "Waiting for repository index..."}
              disabled={!indexing.repo || chat.isAsking}
              className="w-full bg-overlay/80 backdrop-blur-md border border-border/60 text-txt rounded-2xl px-6 py-4.5 pr-20 text-[15px] focus:border-cyan/50 focus:ring-4 focus:ring-cyan/5 outline-none transition-all resize-none shadow-2xl disabled:opacity-20 placeholder:text-txt-muted/40 leading-relaxed font-sans"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend(e);
              }}
            />
            
            {/* Status Indicator inside input */}
            <div className="absolute right-16 bottom-5 hidden sm:flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${chat.isAsking ? 'bg-cyan animate-pulse shadow-[0_0_8px_cyan]' : 'bg-txt-muted/30'}`} />
            </div>

            <button 
              type="submit"
              disabled={!indexing.repo || !input.trim() || chat.isAsking}
              className="absolute right-2.5 bottom-2.5 p-3 rounded-xl bg-cyan text-void disabled:opacity-0 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan/20 flex items-center justify-center overflow-hidden"
            >
              <div className="relative z-10">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925L10.788 10l-7.095 1.836-1.414 4.925a.75.75 0 00.826.95 44.896 44.896 0 0012.845-7.425.75.75 0 000-1.212A44.896 44.896 0 003.105 2.289z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Desktop Mode Switch - Quick Access */}
          <div className="hidden lg:flex flex-col bg-overlay border border-border p-1 rounded-xl mb-1 shadow-xl">
            {["semantic", "keyword"].map((m) => (
              <button 
                key={m}
                onClick={() => chat.setMode(m)}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${chat.mode === m ? "bg-cyan text-void" : "text-txt-muted hover:text-txt"}`}
              >
                {m[0]}
              </button>
            ))}
          </div>
        </form>

        <div className="flex justify-between items-center px-3">
          <div className="flex items-center gap-4 text-[10px] font-mono text-txt-muted/60 uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-overlay px-1.5 py-0.5 rounded border border-border min-w-[2.5rem] text-center">Enter</kbd>
              <span>to send</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <kbd className="bg-overlay px-1.5 py-0.5 rounded border border-border">Shift</kbd>
              <span>+</span>
              <kbd className="bg-overlay px-1.5 py-0.5 rounded border border-border">Enter</kbd>
              <span>newline</span>
            </span>
          </div>

          {/* Mobile Mode Switch */}
          <div className="lg:hidden flex bg-overlay border border-border rounded-xl p-0.5 scale-90 shadow-xl">
            {["semantic", "keyword"].map((m) => (
              <button 
                key={m}
                onClick={() => chat.setMode(m)}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${chat.mode === m ? "bg-cyan text-void" : "text-txt-muted"}`}
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
