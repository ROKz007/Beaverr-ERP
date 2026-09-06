import axios from "axios";

export function createApiClient(baseURL: string) {
  const client = axios.create({ baseURL, withCredentials: true });
  let accessToken: string | null = null;

  client.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const { data } = await client.post("/api/auth/refresh");
        accessToken = data.data.accessToken;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return client.request(original);
      }
      return Promise.reject(error);
    },
  );

  return {
    client,
    setAccessToken: (token: string | null) => (accessToken = token),
    getAccessToken: () => accessToken,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>["client"];
