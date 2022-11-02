import axios from "axios";

export async function requestAuthenticateUsername(brukernavn?: string | null) {
  const { data } = await axios.get<string>(`/api/auth?username=${brukernavn}`);
  return data;
}
