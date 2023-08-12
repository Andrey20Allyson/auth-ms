import "./controllers";
import { Database } from "./database";
import { services } from "./services";
import { Container } from "./utils/injection";
import { Server, ServerConfig } from "./utils/server";

export const container = new Container();

container.register(
  Database,
  ...services,
);

const config: Partial<ServerConfig> = {
  container,
};

Server.boot(config);