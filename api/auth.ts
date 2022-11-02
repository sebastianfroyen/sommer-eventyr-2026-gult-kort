import { VercelRequest, VercelResponse } from "@vercel/node";
import { APP_NUMBER, SHARED_API_KEY } from "./_config";
import { checkUsernameIsValid, updateSublevel } from "./_helpers";

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

  const usernameResponse = await checkUsernameIsValid(username);

  /*
   * Register initial progress.
   */
  const sublevelResponse = await updateSublevel(0, username);

  /**
   * Only return 200 response if both username check and
   * progress-registration were successful.
   */
  if (usernameResponse.status === 200 && sublevelResponse.status === 200) {
    response.status(200).send(`Authentication successful.`);
  } else {
    response.status(401).send(`Authentication failed.`);
  }
}
