import { container } from "./container";
import "./services";
import "./database";
import "./controllers";
import { Server, ServerConfig } from "./utils/server";

const config: Partial<ServerConfig> = {
  container,
};

Server.boot(config);