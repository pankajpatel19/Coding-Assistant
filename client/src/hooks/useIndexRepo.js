import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ragApi } from "../api/ragApi";
import { toast } from "react-hot-toast";

export function useIndexRepo() {
  const [indexedRepo, setIndexedRepo] = useState(null);

  const mutation = useMutation({
    mutationFn: ({ repoUrl, force }) => {
      const promise = ragApi.indexRepo({ repoUrl, force });
      toast.promise(promise, {
        loading: "Indexing repository...",
        success: () => `Indexed ${repoUrl.split("/").pop()} successfully!`,
        error: (err) =>
          err?.response?.data?.message || "Failed to index repository",
      });
      return promise;
    },
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
