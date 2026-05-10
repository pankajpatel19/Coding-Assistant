import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ragApi } from "../api/ragApi";

export function useIndexRepo() {
  const [indexedRepo, setIndexedRepo] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ repoUrl, force }) => ragApi.indexRepo({ repoUrl, force }),
    onSuccess: (data, variables) => {
      setIndexedRepo(variables.repoUrl);
    },
  });

  return {
    indexRepo: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    indexedRepo,
    setIndexedRepo,
  };
}
