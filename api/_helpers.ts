import { gql } from "graphql-request";
import { APP_NUMBER, graphQLClient } from "./_config.js";

type AppTracking = {
  id: string;
  appNumber: number;
  subLevelsCompleted: number;
}

type User = {
  id: string;
  username: string;
  currentApp: number;
  currentSubLevel: number;
  appTracking: AppTracking[];
  userCreatedAt: string;
}

type UpdateUser = {
  message: string;
}

export const getUserFromEventyrApi = async (
  username: string | string[]
): Promise<User> => {
  const response = await graphQLClient.request<{ getUser: User }>(
    gql`
      query GetUser($username: String) {
        getUser(username: $username) {
          id
          username
          currentApp
          currentSubLevel
          appTracking {
            id
            appNumber
            subLevelsCompleted
          }
          userCreatedAt
        }
      }
    `,
    {
      username: username
    }
  );

  return response.getUser;
};

export const updateSublevel = async (
  subLevel: number,
  username: string | string[]
): Promise<string> => {
  const response = await graphQLClient.request<{ updateUser: UpdateUser }>(
    gql`
      mutation UpdateUser($updateUserInput: UpdateUserInput) {
        updateUser(updateUserInput: $updateUserInput) {
          message
        }
      }
    `,
    {
      updateUserInput: {
        username: username,
        subLevel: subLevel,
        appNumber: parseInt(APP_NUMBER as string)
      }
    }
  );

  return response.updateUser.message;
};

export function isProgressRegistered(apiResponse: User) {
  if (apiResponse && apiResponse.appTracking) {
    const { appTracking } = apiResponse;

    return appTracking.some((app) => app.appNumber === parseInt(APP_NUMBER as string));
  }

  throw Error("User not found in database.")
}