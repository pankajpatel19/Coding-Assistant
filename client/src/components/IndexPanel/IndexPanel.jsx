import { useState } from "react";
import { useRag } from "../../context/RagContext";

export function IndexPanel() {
  const { indexing, session } = useRag();
  const {
    run: onIndex,
    isPending,
    isSuccess,
    repo: indexedRepo,
    error,
  } = indexing;

  const [url, setUrl] = useState("");
  const [force, setForce] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || isPending) return;
    onIndex({ repoUrl: url.trim(), force });
  };

  const repoName = indexedRepo
    ? indexedRepo.replace("https://github.com/", "")
    : null;

  return (
    <div className="flex flex-col gap-10 p-8 border-r border-border h-full bg-base overflow-y-auto w-80 flex-shrink-0 shadow-2xl relative">
      {/* Brand Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-dim border border-cyan-border text-cyan shadow-[0_0_25px_rgba(0,212,170,0.15)]">
          <span className="text-2xl">⬡</span>
        </div>
        <div>
          <h1 className="font-bold text-txt text-lg leading-tight tracking-tight">
            Code RAG
          </h1>
          <p className="text-[10px] font-mono text-txt-soft mt-0.5 uppercase tracking-[0.2em] opacity-70">
            Assistant v1.0
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-border-dim via-border to-border-dim mx-[-2rem]" />

      {/* Index Section */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold text-txt-muted uppercase tracking-[0.15em] ml-1">
              Connect Repository
            </label>
            <input
              type="text"
              placeholder="owner/repo"
              className="w-full bg-overlay border border-border text-txt rounded-xl px-4 py-3 text-sm font-mono focus:border-cyan outline-none transition-all placeholder:text-txt-muted/50"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group ml-1">
            <input
              type="checkbox"
              className="h-4 w-4 accent-cyan cursor-pointer"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              disabled={isPending}
            />
            <span className="text-xs text-txt-soft group-hover:text-txt transition-colors font-medium">
              Force Re-index
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="w-full bg-cyan hover:bg-cyan-light disabled:opacity-30 text-void font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan/10 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isPending && (
              <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin-sm" />
            )}
            <span>{indexedRepo ? "Refresh Index" : "Start Indexing"}</span>
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-4 rounded-xl bg-err-dim border border-err/20 text-err text-[13px] animate-fade-up">
              <div className="font-bold mb-1 uppercase text-[10px] tracking-widest opacity-80 text-err">
                Indexing Failed
              </div>
              {error?.response?.data?.message || "Verify the repo URL."}
            </div>
          )}
          {isSuccess && !error && (
            <div className="p-4 rounded-xl bg-ok-dim border border-ok/20 text-ok text-[13px] flex items-center gap-3 animate-fade-up font-medium font-mono">
              <div className="w-2 h-2 rounded-full bg-ok animate-pulse-dot" />
              Index synched
            </div>
          )}
          {indexedRepo && (
            <div className="p-5 rounded-2xl bg-elevated border border-border border-l-[3px] border-l-cyan animate-fade-up shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-txt-muted font-bold mb-2">
                Active Context
              </p>
              <p className="text-[13px] font-mono text-cyan truncate leading-none">
                {repoName}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={session.reset}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border-dim hover:border-err/30 group transition-all"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest group-hover:text-err/70 transition-colors">
              Emergency
            </span>
            <span className="text-xs text-txt-soft font-medium group-hover:text-err transition-colors">
              Reset Session
            </span>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-txt-muted group-hover:text-err transition-all"
          >
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
