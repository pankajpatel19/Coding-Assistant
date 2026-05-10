import { createContext, useContext } from "react";
import { useSession } from "../hooks/useSession";
import { useIndexRepo } from "../hooks/useIndexRepo";
import { useAskQuestion } from "../hooks/useAskQuestion";

const RagContext = createContext(null);

export function RagProvider({ children }) {
  const { sessionId, reset: resetSession } = useSession();
  const {
    indexRepo,
    isPending: isIndexing,
    isSuccess: isIndexed,
    indexedRepo,
    error: indexError,
  } = useIndexRepo();

  const { messages, ask, isAsking, mode, setMode, clearLocalHistory } =
    useAskQuestion();

  const value = {
    session: { id: sessionId, reset: resetSession },
    indexing: {
      run: indexRepo,
      isPending: isIndexing,
      isSuccess: isIndexed,
      repo: indexedRepo,
      error: indexError,
    },
    chat: {
      messages,
      ask,
      isAsking,
      mode,
      setMode,
      clear: clearLocalHistory,
    },
  };

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>;
}

export const useRag = () => {
  const context = useContext(RagContext);
  if (!context) throw new Error("useRag must be used within a RagProvider");
  return context;
};
