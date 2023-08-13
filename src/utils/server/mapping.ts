import { Router } from "express";
import { ServerResponse } from "../utils";
import { TypedRequest } from "./type-check";
import {
  ControllerType,
  ControllerConstructor,
  ControllerData,
  RouteMappingOptions,
  RouteMappingDecoratorReturn,
  RouteHandler,
  createMethodMappingDecorator,
  routerMethods
} from "./utils";

export interface ControllerMappingOptions {
  path?: string;
}

export const routers = new Map<ControllerType, Router>();

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

export function getRouter(controller: ControllerType) {
  let router = routers.get(controller);
  if (router) return router;

  router = Router();

  routers.set(controller, router);

  return router;
}

export const controllersData: Map<ControllerConstructor, ControllerData> = new Map();

export function Route(options: RouteMappingOptions = {}): RouteMappingDecoratorReturn {
  return (
    target: RouteHandler,
    ctx: ClassMethodDecoratorContext<any, RouteHandler>
  ) => {
    ctx.addInitializer(function () {
      initializeRoute(this as any, target as any, options);
    });
  };
}

Route.Get = createMethodMappingDecorator(Route, 'GET');
Route.Post = createMethodMappingDecorator(Route, 'POST');
Route.Put = createMethodMappingDecorator(Route, 'PUT');
Route.Patch = createMethodMappingDecorator(Route, 'PATCH');
Route.Delete = createMethodMappingDecorator(Route, 'DELETE');
Route.Head = createMethodMappingDecorator(Route, 'HEAD');
Route.Options = createMethodMappingDecorator(Route, 'OPTIONS');
Route.Trace = createMethodMappingDecorator(Route, 'TRACE');

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
      return res.status(500).send(ServerResponse.error(error));
    }
  });
}
