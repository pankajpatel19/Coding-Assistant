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
          className="fixed inset-0 bg-void/90 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "-translate-x-full lg:translate-x-0"}
      `}>
        <IndexPanel />
      </aside>

      {/* Main Experience Section */}
      <main className="flex-1 flex flex-col min-w-0 bg-base relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border/80 flex items-center justify-between px-6 lg:px-10 bg-base/60 backdrop-blur-2xl z-40 sticky top-0 shadow-lg shadow-void/20">
          <div className="flex items-center gap-6">
            {/* Mobile Burger Menu */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-overlay border border-border rounded-xl text-txt-soft hover:text-cyan transition-all hover:border-cyan/30 active:scale-90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${indexing.repo ? 'bg-cyan' : 'bg-txt-muted/20'} transition-colors duration-1000`} />
                {indexing.repo && <div className="absolute inset-0 bg-cyan rounded-full animate-ping opacity-30" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-txt-muted uppercase tracking-[0.2em] leading-none mb-1.5 opacity-60">
                  {chat.summary ? "Conversation Memory" : "Core Session"}
                </span>
                <span className="text-[12px] font-mono text-txt/90 font-medium tracking-tight truncate max-w-[280px] selection:bg-cyan/20">
                  {chat.summary || `ID_${session.id.slice(0, 16).toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {chat.messages.length > 0 && (
              <button 
                onClick={chat.clear}
                className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-err-dim/5 border border-err/10 hover:border-err/40 hover:bg-err-dim/10 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-err/60 group-hover:text-err transition-colors">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-[10px] font-bold text-err/60 group-hover:text-err uppercase tracking-widest transition-colors">Wipe Chat</span>
              </button>
            )}

            <div className="hidden sm:flex items-center bg-overlay/50 border border-border/80 rounded-xl p-1 shadow-2xl backdrop-blur-md">
              {["semantic", "keyword"].map((m) => (
                <button 
                  key={m}
                  onClick={() => chat.setMode(m)}
                  className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all duration-500 ${chat.mode === m ? "bg-cyan text-void shadow-[0_0_20px_rgba(0,212,170,0.3)]" : "text-txt-muted hover:text-txt hover:bg-white/5"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Chat Feed */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <ChatFeed />
        </div>

        {/* Floating Input Controller */}
        <InputBar />
      </main>
    </div>
  );
}
