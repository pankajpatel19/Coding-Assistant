import ReactMarkdown from "react-markdown";

export function UserMessage({ text, timestamp }) {
  return (
    <div className="flex flex-col items-end gap-3 px-6 animate-fade-up self-end max-w-[85%] group">
      <div className="flex items-center gap-3 text-[10px] font-mono text-txt-muted/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="bg-overlay px-2 py-0.5 rounded border border-border">
          {fmt(timestamp)}
        </span>
        <span className="font-black text-cyan/70 uppercase tracking-widest">
          Sent By You
        </span>
      </div>
      <div className="bg-cyan/10 border border-cyan/20 text-txt px-5 py-3.5 rounded-3xl rounded-tr-none text-[15px] leading-relaxed shadow-xl shadow-cyan/5 selection:bg-cyan/30">
        {text}
      </div>
    </div>
  );
}

export function AiMessage({ answer, files, timestamp }) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 animate-fade-up self-start max-w-[95%] w-full group">
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-cyan font-black uppercase tracking-[0.2em]">
          <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_12px_cyan] animate-pulse" />
          Neural Assistant
        </div>
        <span className="text-txt-muted/50 font-medium bg-overlay px-2 py-0.5 rounded border border-border/50">
          {fmt(timestamp)}
        </span>
      </div>

      <div className="bg-elevated/40 backdrop-blur-sm border border-border/80 text-txt px-6 py-6 rounded-3xl rounded-tl-none text-[15px] leading-[1.8] w-full shadow-2xl relative overflow-hidden group-hover:border-cyan/20 transition-colors duration-500">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan/5" />

        <div className="prose prose-invert max-w-none prose-sm font-sans text-txt/90 prose-headings:text-cyan prose-a:text-cyan prose-strong:text-cyan-light selection:bg-cyan/20">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <div
                  className="my-6 overflow-x-auto bg-void/80 rounded-2xl border border-border/80 p-5 shadow-inner group/code relative"
                  {...props}
                >
                  <div className="absolute top-3 right-4 text-[9px] font-mono text-txt-muted/30 uppercase tracking-widest pointer-events-none group-hover/code:text-cyan/40 transition-colors">
                    Code Block
                  </div>
                </div>
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-cyan/10 text-cyan-light px-2 py-0.5 rounded-md text-[13px] font-mono border border-cyan/10"
                    {...props}
                  />
                ) : (
                  <code
                    className="text-txt-code font-mono text-[14px] leading-relaxed block"
                    {...props}
                  />
                ),
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>

        {files?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border-dim/50">
            <div className="flex items-center gap-2 mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3 h-3 text-txt-muted"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                Contextual References
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-overlay/50 border border-border/50 rounded-lg text-[12px] font-mono text-txt-soft hover:text-cyan hover:border-cyan/30 transition-all cursor-default shadow-sm"
                  title={file}
                >
                  {file.split("/").pop()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorMessage({ text }) {
  return (
    <div className="mx-auto my-6 px-6 py-3 bg-err-dim/10 border border-err/20 text-err text-[12px] font-bold rounded-full flex items-center gap-3 animate-fade-up uppercase tracking-widest shadow-lg shadow-err/5">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-err text-void font-black">
        !
      </span>
      {text}
    </div>
  );
}

const fmt = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
