import { GraphQLClient } from "graphql-request";

export const APP_NUMBER = process.env.APP_NUMBER;
export const SHARED_API_KEY = process.env.SHARED_API_KEY;

export const SHARED_API_URL = "https://frontend-graphql-api.vercel.app/graphql";

export const graphQLClient = new GraphQLClient(SHARED_API_URL);

graphQLClient.setHeaders({
  'x-api-key': `${SHARED_API_KEY}`,
});