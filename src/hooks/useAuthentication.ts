import { useQuery } from "@tanstack/react-query";
import { useUsername } from "@/hooks/useUsername";

import { requestAuthenticateUsername } from "@/api/auth";

export const useAuthentication = () => {
  const { username } = useUsername();

  const { isLoading: loading, data: authenticated } = useQuery({
    queryKey: [`authenticate${username}`],
    queryFn: () => requestAuthenticateUsername(username),
    enabled: !!username,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { authenticated, loading };
};
