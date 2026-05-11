import React from "react";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-cyan-dim flex items-center justify-center border border-border-bright rotate-3">
            <svg 
              className="w-12 h-12 text-cyan animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-err rounded-full animate-ping" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-txt">
            We'll be <span className="text-cyan">Back Soon</span>
          </h1>
          <p className="text-txt-soft text-lg leading-relaxed">
            The Code-RAG Assistant is currently undergoing emergency maintenance to improve security and performance.
          </p>
        </div>

        <div className="p-4 bg-void border border-border rounded-2xl">
          <div className="flex items-center gap-3 text-left">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-txt-muted">
              Estimated Downtime: ~2 Hours
            </span>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-sm text-txt-muted">
            Sorry for the inconvenience. We're working hard to restore access as quickly as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
