import { VercelRequest, VercelResponse } from "@vercel/node";
import { APP_NUMBER, SHARED_API_KEY } from "./_config.js";
import { getUserFromEventyrApi, isProgressRegistered, updateSublevel } from "./_helpers.js";

/**
 * IMPORTANT: Environment variables must be configured for project on:
 * https://vercel.com/<username>/<project-name>/settings/environment-variables
 *
 * Use key "SHARED_API_KEY" to set the shared api key value.
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { username } = request.query;

  if (!APP_NUMBER) {
    throw Error("Missing environment variable APP_NUMBER");
  }

  if (!SHARED_API_KEY) {
    throw Error("Missing environment variable SHARED_API_KEY");
  }

  if (APP_NUMBER === undefined || SHARED_API_KEY === undefined) {
    return response
      .status(400)
      .send(`Authentication failed. Missing required environment variables.`);
  }

  const usernameResponse = await getUserFromEventyrApi(username);

  /**
   * Only move on if username check was successful.
   */
  if (usernameResponse) {
    const data = usernameResponse;

    /* Happy path - everything checks out OK. */
    if (isProgressRegistered(data)) {
      return response.status(200).send(`Authentication successful.`);
    } else {
      /* Register progress using app number. */
      const progressRequest = await updateSublevel(0, username);

      /* Registration OK - allow user to proceed. */
      if (progressRequest === 'Ok') {
        return response.status(200).send(`Authentication successful.`);
      }

      /* Registration failed - block user from proceeding. */
      return response.status(401).send(`Authentication failed.`);
    }
  } else {
    /* Username not found - block user from proceeding. */
    return response.status(401).send(`Authentication failed.`);
  }
}
