import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { ragApi } from "../api/ragApi";
import { toast } from "react-hot-toast";

export function useAskQuestion() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("semantic");
  const [summary, setSummary] = useState(null);
  const [creditsRemaining, setCreditsRemaining] = useState(3);

  const append = useCallback((msg) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Date.now() + Math.random() },
    ]);
  }, []);

  const mutation = useMutation({
    mutationFn: ({ question }) => ragApi.askQuestion({ question, mode }),
    onMutate: ({ question }) => {
      append({ role: "user", text: question, timestamp: Date.now() });
    },
    onSuccess: (data) => {
      const raw = data.answer;
      setSummary(data.summary); // Store history summary
      if (typeof data.creditsRemaining !== 'undefined') {
        setCreditsRemaining(data.creditsRemaining);
      }
      append({
        role: "assistant",
        answer: typeof raw === "object" ? raw.answer : raw,
        files: typeof raw === "object" ? (raw.files_referenced ?? []) : [],
        timestamp: Date.now(),
      });
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
          
      append({
        role: "error",
        text: errorMsg,
        timestamp: Date.now(),
      });
      
      toast.error(errorMsg);
      if (error?.response?.data?.creditsRemaining === 0) {
        setCreditsRemaining(0);
        toast.error("Credits exhausted! Try again later.");
      }
    },
  });

  const ask = useCallback(
    (question) => {
      if (!question.trim() || mutation.isPending) return;
      mutation.mutate({ question });
    },
    [mutation, mode],
  );

  const clearLocalHistory = useCallback(() => {
    setMessages([]);
    setSummary(null);
  }, []);

  return {
    messages,
    mode,
    setMode,
    ask,
    isAsking: mutation.isPending,
    clearLocalHistory,
    summary,
    creditsRemaining,
  };
}
