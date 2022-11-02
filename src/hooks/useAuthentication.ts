import { useQuery } from "react-query";
import { useUsername } from "@/hooks/useUsername";

import { requestAuthenticateUsername } from "@/api/auth";

export const useAuthentication = () => {
  const { username } = useUsername();

  const { isLoading: loading, isSuccess: authenticated } = useQuery(
    `authenticate${username}`,
    () => requestAuthenticateUsername(username),
    { enabled: !!username, retry: false, refetchOnWindowFocus: false }
  );

  return { authenticated, loading };
};
