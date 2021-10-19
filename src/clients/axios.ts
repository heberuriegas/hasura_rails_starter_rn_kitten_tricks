import axios from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { AUTH_URL } from '@env';

export type CustomAxiosResponse = AxiosResponse<any> & {
  config: {
    skipTransformData?: boolean;
    preserveDataKeys?: string[];
  };
};

export type CustomAxiosRequestConfig = AxiosRequestConfig & {
  config: {
    skipTransformData?: boolean;
    skipTransformParams?: boolean;
    preserveParamsKeys?: string[];
    preserveDataKeys?: string[];
  };
};

const setupAxiosInterceptors = _axios => {
  // Axios middleware to convert all api responses to camelCase
  _axios.interceptors.response.use((response: CustomAxiosResponse) => {
    if (response.data) {
      response.data = camelizeKeys(response.data, (key, convert) => {
        return (response.config &&
          response.config.preserveDataKeys &&
          response.config.preserveDataKeys.includes(key)) ||
          (response.config && response.config.skipTransformData)
          ? key
          : convert(key);
      });
    }
    return response;
  });

  // Axios middleware to convert all api requests to snake_case
  _axios.interceptors.request.use((request: CustomAxiosRequestConfig) => {
    const newRequest = { ...request };
    if (request.params) {
      newRequest.params = decamelizeKeys(request.params, (key, convert) => {
        return (request.config &&
          request.config.preserveParamsKeys &&
          request.config.preserveParamsKeys.includes(key)) ||
          (request.config && request.config.skipTransformParams)
          ? key
          : convert(key);
      });
    }
    if (request.data) {
      newRequest.data = decamelizeKeys(request.data, (key, convert) => {
        return (request.config &&
          request.config.preserveParamsKeys &&
          request.config.preserveParamsKeys.includes(key)) ||
          (request.config && request.config.skipTransformParams)
          ? key
          : convert(key);
      });
    }
    return newRequest;
  });
};

const authAxios = axios.create({
  baseURL: AUTH_URL,
});

setupAxiosInterceptors(authAxios);

export { authAxios };
