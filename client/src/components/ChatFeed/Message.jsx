import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-hot-toast";

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/code relative my-4 sm:my-6 rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-void border-b border-border">
        <span className="text-[10px] font-bold font-mono text-txt-muted uppercase tracking-widest">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-surface text-txt-muted hover:text-cyan transition-all active:scale-95"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {copied ? "Copied!" : "Copy"}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
            {copied ? (
              <path d="M5 13l4 4L19 7" />
            ) : (
              <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            )}
          </svg>
        </button>
      </div>
      <div className="text-[12px] sm:text-[14px]">
        <SyntaxHighlighter
          language={language}
          style={isDark ? atomDark : prism}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: isDark ? "transparent" : "#f8fafc",
            fontSize: "inherit",
            lineHeight: "1.6",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export function UserMessage({ text, timestamp }) {
  return (
    <div className="flex flex-col items-end gap-2 px-6 animate-fade-up self-end max-w-[85%]">
      <div className="flex items-center gap-2 text-[10px] font-mono text-txt-muted/60">
        <span className="font-bold uppercase tracking-widest">You</span>
        <span>•</span>
        <span>{fmt(timestamp)}</span>
      </div>
      <div className="bg-cyan text-white px-5 py-3 rounded-2xl rounded-tr-none text-[15px] leading-relaxed shadow-lg shadow-cyan/10">
        {text}
      </div>
    </div>
  );
}

export function AiMessage({ answer, files, timestamp }) {
  return (
    <div className="flex flex-col items-start gap-2.5 sm:gap-4 px-3 sm:px-6 animate-fade-up self-start max-w-full w-full group">
      <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono">
        <div className="flex items-center gap-2.5 text-cyan font-bold uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_10px_cyan]" />
          Assistant
        </div>
        <span className="text-txt-muted/40">•</span>
        <span className="text-txt-muted/60">{fmt(timestamp)}</span>
      </div>

      <div className="bg-surface/50 border border-border text-txt px-4 py-4 sm:px-7 sm:py-7 rounded-2xl sm:rounded-3xl rounded-tl-none text-[13px] sm:text-[15.5px] leading-6 sm:leading-relaxed w-full shadow-sm relative overflow-hidden group-hover:border-cyan/20 transition-all duration-500">
        <div className="prose prose-technical max-w-none prose-sm selection:bg-cyan/10 prose-p:my-2 sm:prose-p:my-3 prose-pre:my-3 sm:prose-pre:my-4">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const lang = match ? match[1] : "";
                const content = String(children).replace(/\n$/, "");

                return !inline ? (
                  <CodeBlock language={lang} value={content} />
                ) : (
                  <code
                    className="bg-cyan/10 text-cyan font-semibold px-1.5 py-0.5 rounded text-[12px] sm:text-[13.5px] font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {answer}
          </ReactMarkdown>
        </div>

        {files?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <path d="M13 2v7h7" />
              </svg>
              Referenced Files
            </p>
            <div className="flex flex-wrap gap-2">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-void border border-border rounded-xl text-[11px] font-mono text-txt-soft hover:text-cyan hover:border-cyan/30 transition-all cursor-default"
                >
                  {file?.split("/").pop()}
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
    <div className="mx-auto my-6 px-6 py-3 bg-err/5 border border-err/20 text-err text-[11px] font-bold rounded-full flex items-center gap-3 animate-fade-up uppercase tracking-widest shadow-sm">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-err text-white text-[9px]">!</span>
      {text}
    </div>
  );
}

const fmt = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
