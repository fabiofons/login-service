import axios, { AxiosRequestConfig } from "axios";
import { camelizeKeys } from "humps";

type CreateAxiosClientOptions = {
  options: {
    baseURL: string;
    headers: AxiosRequestConfig["headers"];
    timeout?: number;
  };
  getCurrentAccessToken: () => string | null;
  getCurrentRefreshToken: () => string | null;
  refreshTokenUrl: string;
  logout: () => void;
  setRefreshedTokens: (tokens: {
    accessToken: string;
    accessExpiresAt: string;
  }) => void;
};

let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}[] = [];
let isRefreshing = false;

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

export function createAxiosClient({
  options,
  getCurrentAccessToken,
  getCurrentRefreshToken,
  refreshTokenUrl,
  logout,
  setRefreshedTokens,
}: CreateAxiosClientOptions) {
  const client = axios.create(options);

  client.interceptors.request.use(
    (config) => {
      const accessToken = getCurrentAccessToken();
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const refreshToken = getCurrentRefreshToken();
      const handleError = (error: any) => {
        processQueue(error);
        logout();
        return Promise.reject(error);
      };
      if (
        refreshToken &&
        error.response &&
        error.response.status === 401 &&
        error.response.data?.kind === "token" &&
        originalRequest?.url !== refreshTokenUrl &&
        originalRequest?._retry !== true
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
        isRefreshing = true;
        originalRequest._retry = true;
        return client
          .post(
            refreshTokenUrl,
            {},
            {
              headers: {
                "X-Refresh-Token": refreshToken,
              },
            }
          )
          .then((res) => {
            const tokensCamelized = camelizeKeys(res.data);
            const tokens = {
              accessToken: tokensCamelized.access,
              accessExpiresAt: tokensCamelized.accessExpiresAt,
            };
            setRefreshedTokens(tokens);
            processQueue(null);

            return client(originalRequest);
          }, handleError)
          .finally(() => {
            isRefreshing = false;
          });
      }
      if (
        !refreshToken &&
        error.response.status === 401 &&
        error.response?.data.kind === "token"
      ) {
        logout();
        window.location.href = "/auth/login";
      }
      if (
        error.response.status === 401 &&
        error.response?.data.kind === "role"
      ) {
        logout();
        window.location.href = "/not-authorized";
      }
      throw error;
    }
  );

  return client as any as typeof axios;
}
