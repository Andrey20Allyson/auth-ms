import { Request } from "express";
import { ZodType } from "zod";

export type ParamsType = Record<string, string>;
export type QueryType = { [K in string]: undefined | string | string[] | QueryType | QueryType[] };

export interface TypedRequestCheckSchemas<B, Q extends QueryType, P extends ParamsType> {
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
    private readonly _body: B,
    private readonly _query: Q,
    private readonly _params: P,
    private readonly _request: Request,
  ) { }

  check<CB = B, CQ extends QueryType = Q, CP extends ParamsType = P>(schemas: TypedRequestCheckSchemas<CB, CQ, CP>): TypedRequest<CB, CQ, CP> {
    return new TypedRequest(
      this.body(schemas.body),
      this.query(schemas.query),
      this.params(schemas.params),
      this._request,
    );
  }

  body<CB = B>(schema?: ZodType<CB>): CB {
    return TypedRequest.parse(this._body, schema)
  }

  query<CQ = Q>(schema?: ZodType<CQ>): CQ {
    return TypedRequest.parse(this._query, schema);
  }

  params<CP = P>(schema?: ZodType<CP>): CP {
    return TypedRequest.parse(this._params, schema);
  }

  request(): Readonly<Request> {
    return this._request;
  }

  private static parse<V, CV = V>(value: V, schema?: ZodType<CV>): CV {
    return (schema ? schema.parse(value) : value) as CV;
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