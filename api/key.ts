import { getUserFromEventyrApi, updateSublevel } from "./_helpers.js";
import { APP_NUMBER } from "./_config.js";

const FINAL_URL = "https://sommereventyr-2026-lost-captain.vercel.app/";
const key = 'data:video/webm;codecs=vp9;base64';
export const POST = async (request: Request): Promise<Response> => {
  const data = await request.json();

  if (new RegExp(`^${key.replace("vp9", "vp\\d+")}$`).test(data.keyWord)) {
    return new Response(
      JSON.stringify({
        message: "<en beskjed>",
        nextApp: FINAL_URL,
      }),
      { status: 200 },
    );
  }

  return new Response("Wrong result.", {
    status: 401,
  });
};

