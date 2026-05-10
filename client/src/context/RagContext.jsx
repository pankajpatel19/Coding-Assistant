import { createContext, useContext, useState } from "react";
import { useSession } from "../hooks/useSession";
import { useIndexRepo } from "../hooks/useIndexRepo";
import { useAskQuestion } from "../hooks/useAskQuestion";
import { useHistory } from "../hooks/useHistory";
import { ragApi } from "../api/ragApi";

const RagContext = createContext(null);

export function RagProvider({ children }) {
  const { sessionId, reset: resetSessionId } = useSession();
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftSelectionVersion, setDraftSelectionVersion] = useState(0);
  const { 
    indexRepo, 
    isPending: isIndexing, 
    isSuccess: isIndexed, 
    indexedRepo, 
    error: indexError,
    setIndexedRepo
  } = useIndexRepo();
  
  const { 
    messages, 
    ask, 
    isAsking, 
    mode, 
    setMode, 
    clearLocalHistory,
    summary 
  } = useAskQuestion();

  const { repos: history } = useHistory();

  const clearHistory = async () => {
    try {
      await ragApi.clearHistory();
      clearLocalHistory();
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const fullReset = () => {
    resetSessionId();
    clearLocalHistory();
    setDraftQuestion("");
    setIndexedRepo(null);
  };

  const selectDraftQuestion = (question) => {
    setDraftQuestion(question);
    setDraftSelectionVersion((version) => version + 1);
  };

  const value = {
    session: { id: sessionId, reset: fullReset },
    indexing: { 
      run: indexRepo, 
      isPending: isIndexing, 
      isSuccess: isIndexed, 
      repo: indexedRepo, 
      error: indexError,
      history 
    },
    chat: { 
      messages, 
      ask, 
      isAsking, 
      mode, 
      setMode, 
      draftQuestion,
      setDraftQuestion,
      draftSelectionVersion,
      selectDraftQuestion,
      clear: clearHistory,
      summary
    }
  };

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>;
}

export const useRag = () => {
  const context = useContext(RagContext);
  if (!context) throw new Error("useRag must be used within a RagProvider");
  return context;
};
