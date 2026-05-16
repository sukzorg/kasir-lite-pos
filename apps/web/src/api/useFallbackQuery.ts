import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

type ApiEnvelope<T> = {
  data: T;
};

export function useFallbackQuery<T>(queryKey: readonly unknown[], path: string, fallback: T) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.get<ApiEnvelope<T>>(path);
        return response.data.data ?? (response.data as T);
      } catch {
        return fallback;
      }
    }
  });
}
