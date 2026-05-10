import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { ragApi } from "../api/ragApi";

/**
 * Manages chat history and the ask-question mutation.
 */
export function useAskQuestion() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("semantic");

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
      append({
        role: "assistant",
        answer: typeof raw === "object" ? raw.answer : raw,
        files: typeof raw === "object" ? (raw.files_referenced ?? []) : [],
        timestamp: Date.now(),
      });
    },
    onError: (error) => {
      append({
        role: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        timestamp: Date.now(),
      });
    },
  });

  const ask = useCallback(
    (question) => {
      if (!question.trim() || mutation.isPending) return;
      mutation.mutate({ question });
    },
    [mutation, mode],
  );

  const clearLocalHistory = useCallback(() => setMessages([]), []);

  return {
    messages,
    mode,
    setMode,
    ask,
    isAsking: mutation.isPending,
    clearLocalHistory,
  };
}
