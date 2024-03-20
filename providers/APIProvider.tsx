import React, { createContext, useContext } from "react";
import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig } from "axios";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import { useMemo } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

interface APIResponse<DataType> {
  status: string | "success" | "error";
  data: DataType;
  message: string;
}

interface IAPIContext {
  instance: AxiosInstance;
  fetcher: <T>(url: string, params?: any) => Promise<T>;
  poster: <DataType>(
    url: string,
    body?: any,
    options?: AxiosRequestConfig,
  ) => Promise<DataType>;
  putter: <T>(
    url: string,
    body?: any,
    options?: AxiosRequestConfig,
  ) => Promise<T>;
  // graphql: <T>(query: string, variables?: any, operationName?: string) => Promise<T>
}

const apiFunc = <T,>() => {
  console.log("Context is not initialized.");
  return Promise.resolve({} as T);
};

export const APIContext = createContext<IAPIContext>({
  instance: axios.create(),
  fetcher: apiFunc,
  poster: apiFunc,
  putter: apiFunc,
  // graphql: apiFunc,
});

export default function APIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();

  const instance = useMemo(() => {
    const tempInstance = axios.create();
    tempInstance.interceptors.request.use(async (config) => {
      const token = await app.idToken();
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
      return config;
    });
    return tempInstance;
  }, [app]);

  const fetcher = async <DataType,>(url: string, params?: any) => {
    const response = await instance.get<APIResponse<DataType>>(url, { params });
    if (response.data.status === "success") {
      return response.data.data;
    } else {
      throw response.data.message;
    }
  };

  const poster = async <DataType,>(
    url: string,
    body?: any,
    options?: AxiosRequestConfig,
  ) => {
    const response = await instance.post<APIResponse<DataType>>(
      url,
      body,
      options,
    );
    if (response.data.status == "success") {
      return response.data.data;
    } else {
      throw response.data.message;
    }
  };

  const putter = async <DataType,>(
    url: string,
    body?: any,
    options?: AxiosRequestConfig,
  ) => {
    const response = await instance.put<APIResponse<DataType>>(
      url,
      body,
      options,
    );
    if (response.data.status == "success") {
      return response.data.data;
    } else {
      throw response.data.message;
    }
  };

  const graphql = <T,>(
    query: string,
    variables?: any,
    operationName?: string,
  ) => {
    return instance.post<T>(`/api/graphql`, {
      query,
      variables,
      operationName,
    });
  };

  return (
    <APIContext.Provider value={{ instance, fetcher, poster, putter }}>
      {children}
    </APIContext.Provider>
  );
}

export const useFetcher = () => {
  const { fetcher } = useContext(APIContext);
  return fetcher;
};

export const usePoster = () => {
  const { poster } = useContext(APIContext);
  return poster;
};

export const usePutter = () => {
  const { putter } = useContext(APIContext);
  return putter;
};
