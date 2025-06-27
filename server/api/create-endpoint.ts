/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodObject } from 'zod';

// --------------------- Types -----------------------

export type InferParams<T> = T extends ZodObject<any> ? z.infer<T> : never;

type CreateEndpointArgs<
  P extends string,
  R,
  Q extends ZodObject<any> | undefined = undefined,
  M extends string = 'GET' | 'POST' | 'PUT' | 'DELETE',
> = {
  type: M;
  pathname: P;
  params?: Q;
  handler: (config: {
    request: Request;
    parsed: Q extends ZodObject<any> ? z.infer<Q> : never;
  }) => R;
};

export function createEndpoint<
  P extends string,
  R,
  Q extends ZodObject<any> | undefined = undefined,
  M extends string = 'GET' | 'POST' | 'PUT' | 'DELETE',
>(args: CreateEndpointArgs<P, R, Q, M>) {
  return args;
}
