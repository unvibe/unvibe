/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreateAPIConfig<T extends Record<string, unknown>> {
  baseURL: string;
  endpoints: T;
}

export function createAPI<T extends Record<string, any>>(
  config: CreateAPIConfig<T>
) {
  return config;
}
