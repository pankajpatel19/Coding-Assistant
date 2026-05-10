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
    <div className="flex flex-col h-full w-[280px] flex-shrink-0 bg-base border-r border-border/80 overflow-hidden">
      {/* ── Brand Header ── */}
      <div className="px-6 py-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan/10 border border-cyan/20 text-cyan text-xl flex-shrink-0">
            ⬡
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-txt tracking-tight leading-tight">
              Code RAG
            </h1>
            <p className="text-[10px] font-mono text-txt-soft tracking-[0.2em] uppercase mt-0.5 opacity-60">
              Terminal Noir v1.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-y-auto">
        {/* Form Group */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.2em] ml-1">
              Connect Repository
            </span>
            <input
              type="text"
              placeholder="owner / repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              className="w-full bg-elevated border border-border text-txt rounded-xl px-4 py-3 text-[13px] font-mono placeholder:text-txt-muted/40 outline-none focus:border-cyan/30 focus:ring-4 focus:ring-cyan/5 transition-all disabled:opacity-40"
            />
          </div>

          <label className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl cursor-pointer group select-none hover:border-border-bright transition-colors">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-border bg-void checked:border-cyan checked:bg-cyan/20 transition-all"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                disabled={isPending}
              />
              <div className="absolute w-2 h-2 rounded-sm bg-cyan opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none shadow-[0_0_8px_cyan]" />
            </div>
            <span className="text-[12px] text-txt-soft group-hover:text-txt transition-colors font-medium">
              Force Deep Index
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="w-full bg-void border border-border-bright hover:border-cyan/50 disabled:opacity-20 text-txt font-bold py-3.5 rounded-xl text-[12px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-2 group"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-txt-muted/30 border-t-cyan rounded-full animate-spin" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4 text-txt-soft group-hover:text-cyan transition-colors"
              >
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9" />
              </svg>
            )}
            <span>{indexedRepo ? "Sync Source" : "Start Indexing"}</span>
          </button>
        </form>

        <div className="h-px bg-border/50 -mx-6" />

        {/* Error Feedback */}
        {error && (
          <div className="px-4 py-4 rounded-xl bg-err-dim border border-err/20 text-err text-[12px] leading-relaxed animate-fade-up">
            <div className="font-bold mb-1 uppercase text-[10px] tracking-[0.2em] opacity-80">
              Error
            </div>
            {error?.response?.data?.message || "Check GitHub URL."}
          </div>
        )}

        {/* Active Context - Matches Image */}
        {indexedRepo && (
          <div className="px-5 py-5 bg-elevated/40 border border-border border-l-[3px] border-l-cyan rounded-xl animate-fade-up relative group">
            <p className="text-[10px] uppercase tracking-[0.25em] text-txt-muted font-bold mb-3 flex items-center justify-between">
              <span>Active Context</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-dot" />
            </p>
            <p className="text-[14px] font-mono text-cyan truncate font-semibold">
              {repoName}
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-6 border-t border-border/50">
        <button
          onClick={() => window.confirm("Reset session?") && session.reset()}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border hover:border-err/30 hover:bg-err-dim transition-all group active:scale-[0.98]"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.2em] mb-0.5">
              Emergency
            </span>
            <span className="text-[12px] text-txt-soft group-hover:text-err transition-colors font-medium">
              Wipe Session
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface group-hover:bg-err-dim/30 transition-all border border-border">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-txt-muted group-hover:text-err"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
