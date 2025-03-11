export async function requestAuthenticateUsername(
  brukernavn?: string | null
): Promise<boolean> {
  const { status } = await fetch(`/api/auth?username=${brukernavn}`, {
    headers: {
      hostname: window.location.hostname,
    },
  });

  return status === 200;
}
