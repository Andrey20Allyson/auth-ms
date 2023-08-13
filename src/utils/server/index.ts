import express, { Express } from "express";
import { Container } from "../injection";
import { controllersData, routers } from "./mapping";

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

  listen() {
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

export * from './mapping';
export * from './type-check';
export * from './utils';