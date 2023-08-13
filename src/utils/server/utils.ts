import { Router } from "express";
import { TypedRequest } from "./type-check";

export type ControllerType = {};

export type ControllerConstructor = new (...args: any[]) => ControllerType;

export interface ControllerData {
  path: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

export const routerMethods = {
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
export type RouteMappingOptions = {
  /**
   * @default "GET"
   */
  method?: HttpMethod;
  /**
   * @default "/"
   */
  path?: string;
}

export function httpMethodToRouteOptions(method: HttpMethod, optionsOrPath: HttpMethodMappingOptions | string): RouteMappingOptions {
  return typeof optionsOrPath === 'string' ? { method, path: optionsOrPath } : { method, ...optionsOrPath };
}

export type HttpMethodMappingOptions = Omit<RouteMappingOptions, 'method'>

export interface MethodMappingDecorator {
  (options: HttpMethodMappingOptions): RouteMappingDecoratorReturn;
  (path: string): RouteMappingDecoratorReturn;
}

export type RouteMappingDecoratorTarget = (request: TypedRequest) => unknown;
export type RouteMappingDecoratorReturn = (target: RouteMappingDecoratorTarget, ctx: ClassMethodDecoratorContext<ControllerType, RouteMappingDecoratorTarget>) => void; 
export type RouteMappingDecoratorType = (options: RouteMappingOptions) => RouteMappingDecoratorReturn;

export function createMethodMappingDecorator(BaseDecorator: RouteMappingDecoratorType, method: HttpMethod): MethodMappingDecorator {
  return (optionsOrPath = {}) => BaseDecorator(httpMethodToRouteOptions(method, optionsOrPath));
}

