import axios, { AxiosResponse } from "axios";
import { APP_NUMBER, SHARED_API_KEY, SHARED_API_URL } from "./_config.js";

export interface AppTracking {
  _id: string,
  appNumber: number,
  subLevelsCompleted: number,
}

export interface EventyrAPIResponse {
  currentApp: number,
  currentSubLevel: number,
  _id: string,
  username: string,
  userCreatedAt: string,
  appTracking: AppTracking[],
}

export async function getUserFromEventyrApi(
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

export function isProgressRegistered(apiResponse: EventyrAPIResponse) {
  if (apiResponse && apiResponse.appTracking) {
    const { appTracking } = apiResponse;

    return appTracking.some((app) => app.appNumber === parseInt(APP_NUMBER as string));
  }

  throw Error("User not found in database.")
}
