import { useQuery } from "@tanstack/react-query";
import { ragApi } from "../api/ragApi";

export function useHistory() {
  const query = useQuery({
    queryKey: ["repoHistory"],
    queryFn: () => ragApi.getHistory(),
    refetchInterval: 5000, // Refresh history every 5s
  });

  return {
    repos: query.data?.repos || [],
    isLoading: query.isLoading,
    refetch: query.refetch
  };
}
