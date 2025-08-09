const isDev = process.env.NODE_ENV === 'development';

export const FRONTEND_PORT = isDev ? 5173 : 54495;
export const BACKEND_PORT = isDev ? 3008 : 54496;
export const BACKEND_WS_PORT = isDev ? 3006 : 54497;
