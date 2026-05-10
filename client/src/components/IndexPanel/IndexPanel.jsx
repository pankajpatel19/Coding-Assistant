import { useState } from "react";
import { useRag } from "../../context/RagContext";

export function IndexPanel() {
  const { indexing, session } = useRag();
  const { run: onIndex, isPending, repo: indexedRepo, error } = indexing;

  const [url, setUrl] = useState("");
  const [force, setForce] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || isPending) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http")) {
      finalUrl = `https://github.com/${finalUrl}`;
    }

    onIndex({ repoUrl: finalUrl, force });
  };

  const repoName = indexedRepo
    ? indexedRepo.replace("https://github.com/", "")
    : null;

  return (
    <div className="flex flex-col gap-10 p-8 border-r border-border h-full bg-base overflow-y-auto w-80 flex-shrink-0 shadow-2xl relative z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-4 group">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-dim border border-cyan-border text-cyan shadow-[0_0_25px_rgba(0,212,170,0.1)] group-hover:shadow-[0_0_35px_rgba(0,212,170,0.2)] transition-all duration-500">
          <span className="text-2xl animate-pulse-slow">⬡</span>
        </div>
        <div>
          <h1 className="font-bold text-txt text-lg leading-tight tracking-tight selection:bg-cyan/30">
            Code RAG
          </h1>
          <p className="text-[10px] font-mono text-txt-soft mt-0.5 uppercase tracking-[0.2em] opacity-70">
            Terminal Noir v1.0
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-[-2rem]" />

      {/* Index Section */}
      <div className="flex flex-col gap-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center justify-between">
              <span>Connect Repository</span>
              {isPending && (
                <span className="text-cyan animate-pulse lowercase font-normal tracking-normal">
                  Indexing...
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="owner/repo"
              className="w-full bg-overlay border border-border text-txt rounded-xl px-4 py-3.5 text-sm font-mono focus:border-cyan/40 focus:ring-4 focus:ring-cyan/5 outline-none transition-all placeholder:text-txt-muted/30 shadow-inner"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group ml-1 select-none">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-border bg-overlay checked:border-cyan checked:bg-cyan/20 transition-all"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                disabled={isPending}
              />
              <div className="absolute h-2 w-2 rounded-full bg-cyan opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none shadow-[0_0_8px_cyan]" />
            </div>
            <span className="text-xs text-txt-soft group-hover:text-txt transition-colors font-medium">
              Force Deep Index
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="w-full bg-cyan hover:bg-cyan-light disabled:opacity-20 text-void font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan/10 flex items-center justify-center gap-3 active:scale-[0.97] group"
          >
            {isPending ? (
              <div className="w-5 h-5 border-3 border-void/30 border-t-void rounded-full animate-spin" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4 group-hover:rotate-12 transition-transform"
              >
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9" />
              </svg>
            )}
            <span className="tracking-wide uppercase text-[12px]">
              {indexedRepo ? "Sync Source" : "Start Indexing"}
            </span>
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-4 rounded-xl bg-err-dim border border-err/20 text-err text-[13px] animate-fade-up leading-relaxed shadow-xl shadow-err/5">
              <div className="font-bold mb-1 uppercase text-[10px] tracking-widest opacity-80">
                Indexing Error
              </div>
              {error?.response?.data?.message ||
                "Verify GitHub access and URL."}
            </div>
          )}

          {indexedRepo && (
            <div className="p-5 rounded-2xl bg-elevated border border-border border-l-[3px] border-l-cyan animate-fade-up shadow-xl group cursor-default">
              <p className="text-[10px] uppercase tracking-[0.2em] text-txt-muted font-bold mb-2.5 flex items-center justify-between">
                <span>Active Context</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              </p>
              <p className="text-[13px] font-mono text-cyan truncate leading-none group-hover:text-cyan-light transition-colors">
                {repoName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Reset */}
      <div className="mt-auto pt-6 border-t border-border-dim/50">
        <button
          onClick={() => {
            if (
              window.confirm("Reset all session data? This cannot be undone.")
            )
              session.reset();
          }}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-border-dim hover:border-err/20 group transition-all hover:bg-err-dim/5 active:scale-[0.98]"
        >
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-bold text-txt-muted uppercase tracking-[0.2em] group-hover:text-err/60 transition-colors mb-0.5">
              Emergency
            </span>
            <span className="text-[11px] text-txt-soft font-medium group-hover:text-err transition-colors">
              Wipe Session
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-overlay group-hover:bg-err-dim/20 transition-all">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-txt-muted group-hover:text-err group-hover:rotate-12 transition-all"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
