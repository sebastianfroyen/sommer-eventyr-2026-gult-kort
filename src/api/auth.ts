export async function requestAuthenticateUsername(
  brukernavn?: string | null
): Promise<boolean> {
  const { status } = await fetch(`/api/auth?username=${brukernavn}`);

  return status === 200;
}
