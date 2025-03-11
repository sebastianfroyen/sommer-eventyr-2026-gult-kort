import { APP_NUMBER, SHARED_API_KEY } from "./_config.js";
import {
  getRuntimeUrl,
  getUserFromEventyrApi,
  isProgressRegistered,
  updateSublevel,
} from "./_helpers.js";

/**
 * IMPORTANT: Environment variables must be configured for project on:
 * https://vercel.com/<username>/<project-name>/settings/environment-variables
 *
 * Use key "SHARED_API_KEY" to set the shared api key value.
 */
export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url, getRuntimeUrl(request));

  const username = url.searchParams.get("username");

  if (!APP_NUMBER) {
    throw Error("Missing environment variable APP_NUMBER");
  }

  if (!SHARED_API_KEY) {
    throw Error("Missing environment variable SHARED_API_KEY");
  }

  if (APP_NUMBER === undefined || SHARED_API_KEY === undefined) {
    return new Response(
      `Authentication failed. Missing required environment variables.`,
      {
        status: 400,
      }
    );
  }

  if (!username) {
    return new Response(`Authentication failed. Missing username parameter.`, {
      status: 400,
    });
  }

  try {
    const usernameResponse = await getUserFromEventyrApi(username);
    /**
     * Only move on if username check was successful.
     */
    if (usernameResponse) {
      const data = usernameResponse;

      /* Happy path - everything checks out OK. */
      if (isProgressRegistered(data)) {
        return new Response(`Authentication successful.`, {
          status: 200,
        });
      } else {
        /* Register progress using app number. */
        const progressRequest = await updateSublevel(0, username);

        /* Registration OK - allow user to proceed. */
        if (progressRequest === "Ok") {
          return new Response(`Authentication successful.`, {
            status: 200,
          });
        }

        /* Registration failed - block user from proceeding. */
        return new Response(`Authentication failed.`, {
          status: 401,
        });
      }
    } else {
      /* Username not found - block user from proceeding. */
      return new Response(`Authentication failed.`, {
        status: 401,
      });
    }
  } catch (err) {
    return new Response(`Authentication failed.`, {
      status: 401,
    });
  }
};
