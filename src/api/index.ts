import axios, { AxiosError, AxiosHeaderValue, AxiosRequestConfig, AxiosResponseHeaders } from 'axios';

import { TErrorResponse } from '@/types/error';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const getApiRequest = <ResponseType>(
  link: string,
  config?: AxiosRequestConfig,
): Promise<{
  data: ResponseType;
  headers: AxiosResponseHeaders | Partial<Record<string, AxiosHeaderValue>>;
}> => api.get<ResponseType>(link, config).then((res) => ({ data: res.data, headers: res.headers }));

export const postApiRequest = <ResponseType, BodyType>(
  link: string,
  body?: BodyType,
  config?: AxiosRequestConfig,
): Promise<{
  data: ResponseType;
  headers: AxiosResponseHeaders | Partial<Record<string, AxiosHeaderValue>>;
}> =>
  api
    .post<ResponseType>(link, body, config)
    .then((res) => ({ data: res.data, headers: res.headers }))
    .catch((err: AxiosError<TErrorResponse>) => {
      throw JSON.stringify(err.response?.data);
    });
