import { getUserFromEventyrApi, updateSublevel } from "./_helpers.js";
import { APP_NUMBER } from "./_config.js";

const FINAL_URL = "https://sommereventyr-2026-lost-captain.vercel.app/";

export const GET = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return new Response(JSON.stringify({ error: "Missing username parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const user = await getUserFromEventyrApi(username);

    const appNumber = parseInt(APP_NUMBER as string);
    const tracking = user?.appTracking?.find((a) => a.appNumber === appNumber);

    // Require at least three completed sublevels for the app to be considered finished.
    if (tracking && typeof tracking.subLevelsCompleted === "number") {
      if (tracking.subLevelsCompleted >= 3) {
      return new Response(JSON.stringify({ url: FINAL_URL }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      }

      // If they have failed twice (exactly 2 completed), reset their progress to 0.
      if (tracking.subLevelsCompleted === 2) {
        try {
          await updateSublevel(0, username);
        } catch (e) {
          // ignore errors from reset attempt, still deny access
        }

        return new Response(JSON.stringify({ error: "Challenge failed; progress reset" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Challenge not completed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};
