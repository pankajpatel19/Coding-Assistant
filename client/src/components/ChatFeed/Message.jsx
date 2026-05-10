import ReactMarkdown from "react-markdown";

export function UserMessage({ text, timestamp }) {
  return (
    <div className="flex flex-col items-end gap-2 px-4 animate-fade-up self-end max-w-[80%]">
      <div className="flex items-center gap-2 text-[10px] font-mono text-txt-muted">
        <span>{fmt(timestamp)}</span>
        <span className="font-bold text-txt-soft uppercase tracking-tighter">
          You
        </span>
      </div>
      <div className="bg-cyan-dim border border-cyan-border text-txt px-4 py-2.5 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

export function AiMessage({ answer, files, timestamp }) {
  return (
    <div className="flex flex-col items-start gap-2 px-4 animate-fade-up self-start max-w-[90%] w-full">
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className="text-cyan font-bold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,212,170,0.5)]" />
          Assistant
        </span>
        <span className="text-txt-muted">{fmt(timestamp)}</span>
      </div>

      <div className="bg-elevated border border-border text-txt px-5 py-4 rounded-2xl rounded-tl-none text-[14px] leading-relaxed w-full shadow-md">
        <div className="prose prose-invert max-w-none prose-sm font-sans text-txt/90">
          <ReactMarkdown
            components={{
              pre: ({ ...props }) => (
                <div
                  className="my-4 overflow-x-auto bg-void rounded-lg border border-border p-4"
                  {...props}
                />
              ),
              code: ({ inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-overlay text-cyan px-1.5 py-0.5 rounded text-[12px] font-mono border border-border"
                    {...props}
                  />
                ) : (
                  <code
                    className="text-txt-code font-mono text-[13px] leading-relaxed"
                    {...props}
                  />
                ),
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>

        {files?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-dim">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">
              Context references
            </p>
            <div className="flex flex-wrap gap-2">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-overlay border border-border rounded text-[11px] font-mono text-txt-soft truncate max-w-[200px]"
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
    <div className="mx-auto my-4 px-4 py-2 bg-err-dim border border-err/20 text-err text-[12px] rounded-full flex items-center gap-2 animate-fade-up">
      <span>⚠</span>
      {text}
    </div>
  );
}

const fmt = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
