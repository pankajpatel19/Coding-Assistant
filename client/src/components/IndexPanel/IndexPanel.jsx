import { useState } from "react";

export function IndexPanel({
  onIndex,
  isPending,
  isSuccess,
  indexedRepo,
  error,
}) {
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
    <div className="flex flex-col gap-6 p-6 border-r border-border h-full bg-base overflow-y-auto w-80">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-dim border border-cyan-border text-cyan shadow-[0_0_20px_rgba(0,212,170,0.15)]">
          <span className="text-xl">⬡</span>
        </div>
        <div>
          <h1 className="font-bold text-txt leading-none">Code RAG</h1>
          <p className="text-[10px] font-mono text-txt-soft mt-1 uppercase tracking-wider">
            Assistant v1.0
          </p>
        </div>
      </div>

      <div className="h-px bg-border-dim" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
            GitHub Repository
          </label>
          <input
            type="text"
            placeholder="owner/repo"
            className="w-full bg-overlay border border-border text-txt rounded-sm px-3 py-2 text-sm font-mono focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-all placeholder:text-txt-muted"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isPending}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 accent-cyan cursor-pointer"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={isPending}
          />
          <span className="text-xs text-txt-soft group-hover:text-txt transition-colors">
            Force re-index
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="w-full bg-cyan hover:bg-cyan-light disabled:opacity-40 text-void font-bold py-2 rounded-sm text-sm transition-all shadow-lg shadow-cyan/10 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin-sm" />
          ) : null}
          {indexedRepo ? "Sync Repository" : "Index Repository"}
        </button>
      </form>

      <div className="mt-auto space-y-3">
        {error && (
          <div className="p-3 rounded-sm bg-err-dim border border-err/20 text-err text-xs animate-fade-up">
            <span className="font-bold">Error:</span>{" "}
            {error?.response?.data?.message || "Index failed"}
          </div>
        )}

        {isSuccess && !error && (
          <div className="p-3 rounded-sm bg-ok-dim border border-ok/20 text-ok text-xs flex items-center gap-2 animate-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse-dot" />
            Index Complete
          </div>
        )}

        {indexedRepo && (
          <div className="p-3 rounded-sm bg-elevated border border-border border-l-2 border-l-cyan animate-fade-up">
            <p className="text-[10px] uppercase tracking-widest text-txt-muted font-bold mb-1">
              Active Context
            </p>
            <p className="text-xs font-mono text-cyan truncate">{repoName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
