import axios, { AxiosResponse } from "axios";
import { APP_NUMBER, SHARED_API_KEY, SHARED_API_URL } from "./_config";

export async function checkUsernameIsValid(
  username: string | string[]
): Promise<AxiosResponse> {
  return axios({
    method: "GET",
    url: `${SHARED_API_URL}/user/${username}`,
    headers: {
      "x-api-key": SHARED_API_KEY,
      "Content-Type": "application/json",
    },
  });
}

export async function updateSublevel(
  subLevel: number,
  username: string | string[]
): Promise<AxiosResponse> {
  if (APP_NUMBER === undefined || SHARED_API_KEY === undefined) {
    throw Error("Missing required environment variables");
  }

  return axios({
    method: "PUT",
    url: `${SHARED_API_URL}/progress/nextstep`,
    headers: {
      "x-api-key": SHARED_API_KEY || "",
      "Content-Type": "application/json",
    },
    data: {
      appNumber: APP_NUMBER,
      subLevel,
      username,
    },
  });
}
