export class BadRequestError extends Error { }
export class ServerError extends Error { }

export type ServerResponse<T = unknown, E = Error> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: E;
}

export interface ServerResponseConstructor {
  ok<T, E = Error>(data: T): ServerResponse<T, E>;
  error<T = unknown, E = Error>(error: E): ServerResponse<T, E>;
}

export const ServerResponse: ServerResponseConstructor = {
  error(error) {
    return { error, ok: false };
  },

  ok(data) {
    return { data, ok: true };
  }
}