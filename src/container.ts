import { Container } from "./utils/injection";

export const container = new Container();

const decorators = container.decorators();

console.log(decorators);

export const {
  Injectable,
  Inject,
} = decorators;