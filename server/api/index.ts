import { createAPI } from './create-api';
import * as endpoints from './endpoints';
import { baseURL } from './constants';

export const api = createAPI({
  baseURL,
  endpoints,
});

export type API = typeof api;
