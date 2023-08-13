export abstract class Config<D extends object = Record<string, unknown>> {
  constructor(
    protected readonly data: D
  ) { }

  get<K extends keyof D>(config: K): D[K] {
    return this.data[config];
  }

  set<K extends keyof D>(config: K, value: D[K]): this {
    this.data[config] = value;

    return this;
  }
} 