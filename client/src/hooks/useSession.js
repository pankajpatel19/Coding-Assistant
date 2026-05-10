import { useState, useEffect } from "react";
import { setSessionHeader } from "../api/ragApi";

const KEY = "rag:session_id";

const newId = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function useSession() {
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(KEY, id);
    }
    return id;
  });

  // Keep the API header in sync whenever sessionId changes
  useEffect(() => {
    setSessionHeader(sessionId);
  }, [sessionId]);

  const reset = () => {
    const id = newId();
    localStorage.setItem(KEY, id);
    setSessionId(id);
    return id;
  };

  return { sessionId, reset };
}
