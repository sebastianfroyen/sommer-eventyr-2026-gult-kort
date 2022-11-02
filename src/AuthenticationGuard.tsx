import { useAuthentication } from "@/hooks/useAuthentication";

import ErrorPage from "@/pages/error";
import LoadingPage from "@/pages/loading";

interface Props {
  children?: React.ReactNode;
}

const AuthenticationGuard: React.FC<Props> = ({ children }) => {
  const { authenticated, loading } = useAuthentication();

  if (import.meta.env.VITE_NO_AUTH) {
    return <>{children}</>;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return authenticated ? <>{children}</> : <ErrorPage />;
};

export default AuthenticationGuard;
