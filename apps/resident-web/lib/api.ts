import { createApiClient } from "@repo/api-client";

export const { client: api, setAccessToken, getAccessToken } = createApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
);
