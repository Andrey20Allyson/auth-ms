import express, { Request, Express, Router } from "express";
import { ZodError, ZodType } from "zod";
import { Container } from "./injection";
import { BadRequestError, ServerResponse } from "./utils";

export type ControllerType = {};

export type ControllerConstructor = new (...args: any[]) => ControllerType;

const routers = new Map<ControllerType, Router>();

function getRouter(controller: ControllerType) {
  let router = routers.get(controller);
  if (router) return router;

  router = Router();

  routers.set(controller, router);

  return router;
}

export interface ControllerData {
  path: string;
}

export const controllersData: Map<ControllerConstructor, ControllerData> = new Map();

export interface ControllerMappingOptions {
  path?: string;
}

export function Controller(options: ControllerMappingOptions = {}) {
  const {
    path = '/',
  } = options;

  return (
    _target: ControllerConstructor,
    ctx: ClassDecoratorContext<ControllerConstructor>,
  ) => {
    ctx.addInitializer(function () {
      controllersData.set(this, { path });
    });
  };
}

export interface ServerConfig {
  container: Container;
  port: number;
  host: string;
  onBoot: () => void;
}

export class Server {
  readonly app: Express;
  readonly config: ServerConfig;
  
  constructor(config: Partial<ServerConfig> = {}) {
    const {
      onBoot = Server.createBootListener(this),
      container = new Container(),
      host = 'localhost',
      port = 3000,
    } = config;

    this.config = {
      container,
      onBoot,
      host,
      port,
    };

    this.app = express();

    this.app.use(express.json());
  }

  boot() {
    this.initControllers();

    this.listen();
  }

  initControllers() {
    const { container } = this.config;

    for (const [Controller, { path }] of controllersData) {
      const controller = container.create(Controller);

      const router = routers.get(controller);
      if (!router) continue;

      this.app.use(path, router);
    }
  }

  listen(callback?: () => void) {
    const { host, port } = this.config;

    this.app.listen(port, host, this.config.onBoot);
  }

  static boot(config: Partial<ServerConfig> = {}) {
    const server = new this(config);

    server.boot();

    return server;
  }

  private static createBootListener(server: Server) {
    return () => {
      const { host, port } = server.config;

      console.log(`[Started server]: listening ${host}:${port}`);
    }
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

export interface RouteMappingOptions {
  /**
   * @default "GET"
   */
  method?: HttpMethod;
  /**
   * @default "/"
   */
  path?: string;
}

const routerMethods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  HEAD: 'head',
  OPTIONS: 'options',
  TRACE: 'trace',
} as const satisfies { [K in HttpMethod]: keyof Router };

export type RouteHandler = (this: ControllerType, request: TypedRequest) => unknown;

export function Route(options: RouteMappingOptions = {}) {
  return (
    target: RouteHandler,
    ctx: ClassMethodDecoratorContext<any, RouteHandler>
  ) => {
    ctx.addInitializer(function () {
      initializeRoute(this as any, target as any, options);
    });
  };
}

function initializeRoute(
  controller: ControllerType,
  handler: RouteHandler,
  options: RouteMappingOptions
) {
  const {
    method = 'GET',
    path = '/',
  } = options;
  const router = getRouter(controller);

  const routerMethodKey = routerMethods[method];

  router[routerMethodKey](path, async (req, res) => {
    try {
      const result = handler.call(controller, TypedRequest.from(req));

      return res.status(200).send(ServerResponse.ok(await result));
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).send(ServerResponse.error(error.message));
      }

      if (error instanceof Error) {
        return res.status(500).send(ServerResponse.error(error.message));
      }

      return res.status(500).send(ServerResponse.error(error));
    }
  });
}

export type ParamsType = Record<string, string>;
export type QueryType = { [K in string]: undefined | string | string[] | QueryType | QueryType[] };

export interface TypedRequestCheckOptions<B, Q, P extends ParamsType> {
  params?: ZodType<P>,
  query?: ZodType<Q>,
  body?: ZodType<B>,
}

export class TypedRequest<
  B = unknown,
  Q extends QueryType = {},
  P extends ParamsType = {},
> {
  constructor(
    readonly body: B,
    readonly query: Q,
    readonly params: P,
    private readonly _request: Request,
  ) { }

  check<CB = B, CQ extends QueryType = Q, CP extends ParamsType = P>(options: TypedRequestCheckOptions<CB, CQ, CP>): TypedRequest<CB, CQ, CP> {
    const { params, query, body } = options;

    try {
      const checkedParams = params ? params.parse(this.params) : this.params;
      const checkedQuery = query ? query.parse(this.query) : this.query;
      const checkedBody = body ? body.parse(this.body) : this.body;

      return new TypedRequest(
        checkedBody as CB,
        checkedQuery as CQ,
        checkedParams as CP,
        this._request,
      );
    } catch (e) {
      if (e instanceof ZodError) {
        throw new BadRequestError(e.message);
      }

      throw e;
    }
  }

  request(): Readonly<Request> {
    return this._request;
  }

  static from(request: Request): TypedRequest {
    return new TypedRequest(
      request.body,
      request.query,
      request.params,
      request,
    );
  }
}