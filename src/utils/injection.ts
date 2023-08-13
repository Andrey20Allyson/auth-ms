import { PrismaClient } from "@prisma/client";

export type ClassType<T = any, P extends Array<any> = any[]> = new (...args: P) => T;

export class DependencyConsumerStorage {
  private map: Map<ClassType, Map<string | symbol, ClassType>>;

  constructor() {
    this.map = new Map();
  }

  get(Consumer: ClassType) {
    return this.map.get(Consumer);
  }

  dependenciesFrom(Consumer: ClassType) {
    let deps = this.map.get(Consumer);
    if (deps) return deps;

    deps = new Map();

    this.map.set(Consumer, deps);

    return deps;
  }

  addTo(Consumer: ClassType, field: string | symbol, Dependency: ClassType) {
    this.dependenciesFrom(Consumer).set(field, Dependency)
  }

  inject(instance: object) {

  }
}

export class Container {
  dependencies: unknown[];
  private _dependencySet: Set<unknown>;
  private _dependencyConsumerStorage: DependencyConsumerStorage;

  debug: boolean;

  constructor() {
    this.dependencies = [];
    this._dependencySet = new Set();

    this._dependencyConsumerStorage = new DependencyConsumerStorage();

    this.debug = false;
  }

  register(...dependences: unknown[]) {
    for (let dependency of dependences) {
      if (this._dependencySet.has(dependency)) continue;

      this.dependencies.unshift(dependency);
      this._dependencySet.add(dependency);
    }
  }

  registerClass<P extends any[]>(Dependency: ClassType<unknown, P>, ...args: P) {
    const instance = this.create(Dependency, ...args);

    this.register(instance);
  }

  remove(...dependences: unknown[]) {
    this.dependencies = this.dependencies.filter(dep => !dependences.includes(dep));
    this._dependencySet = new Set(this.dependencies);
  }

  create<T extends ClassType>(Consumer: T, ...args: ConstructorParameters<T>): InstanceType<T> {
    const instance: InstanceType<T> = new Consumer(...args);

    const consumerDependencies = this._dependencyConsumerStorage.get(Consumer);

    if (!consumerDependencies) return instance;

    for (const [key, Dependency] of consumerDependencies) {
      const dependency = this.search(Dependency);

      instance[key] = dependency;

      if (this.debug) console.log(`Injected dependency '${key.toString()}: ${Dependency.name}' in ${instance !== null && instance !== undefined ? instance.constructor.name : null}`);
    }

    return instance;
  }

  search<T>(SearchDependency: ClassType<T>): T {
    for (const instance of this.dependencies) {
      if (instance instanceof SearchDependency) return instance;
    }

    throw new Error(`Can't find dependency "${SearchDependency.name}"`);
  }

  decorators() {
    const container = this;

    function Inject<T>(Dependency: ClassType) {
      const storage = container._dependencyConsumerStorage;

      return (_: undefined, ctx: ClassFieldDecoratorContext<any, T>) => {
        ctx.addInitializer(function () {
          const Consumer = this.constructor as ClassType;

          storage.addTo(Consumer, ctx.name, Dependency);
        });
      }
    }

    function Injectable<D extends ClassType>(...params: ConstructorParameters<D>) {
      return (target: D, _ctx: ClassDecoratorContext) => {
        console.log(target.name);

        container.registerClass(target, ...params);
      };
    }

    return { Inject, Injectable };
  }
}