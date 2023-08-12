export type Dependency<T = any> = (new () => T);
export type DependencyConsumer<T = any> = (new () => T) & {
  [DEPENDENCY_FIELD]?: Map<keyof T, Dependency<T[keyof T]>>;
}

const injectables = new Set();

export class Container {
  private _dependences: unknown[];
  private _dependencySet: Set<unknown>;

  debug: boolean;

  constructor() {
    this._dependences = [];
    this._dependencySet = new Set();

    this.debug = false;
  }

  register(...dependences: unknown[]) {
    for (let dependency of dependences) {
      if (this._dependencySet.has(dependency)) continue;

      if (injectables.has(dependency)) {
        dependency = this.create(dependency as DependencyConsumer);
      }

      this._dependences.unshift(dependency);
      this._dependencySet.add(dependency);
    }
  }

  remove(...dependences: unknown[]) {
    this._dependences = this._dependences.filter(dep => !dependences.includes(dep));
    this._dependencySet = new Set(this._dependences);
  }

  create<T>(Consumer: DependencyConsumer<T>): T {
    const instance = new Consumer();

    if (!Consumer[DEPENDENCY_FIELD]) return instance;

    for (const [key, Dependency] of Consumer[DEPENDENCY_FIELD]) {
      const dependency = this.search(Dependency);

      instance[key] = dependency;

      if (this.debug) console.log(`Injected dependency '${key.toString()}: ${Dependency.name}' in ${instance !== null && instance !== undefined ? instance.constructor.name : null}`);
    }

    return instance;
  }

  search<T>(searchDependency: Dependency<T>): T {
    for (const instance of this._dependences) {
      if (instance instanceof searchDependency) return instance;
    }

    throw new Error(`Can't find dependency "${searchDependency.name}"`);
  }
}

export const DEPENDENCY_FIELD = Symbol();
export const INJECTABLE_ANNOTATION = Symbol();

export function Inject<T>(dependency: Dependency) {
  return (_: undefined, ctx: ClassFieldDecoratorContext<any, T>) => {
    ctx.addInitializer(function () {
      const consumer = this.constructor as DependencyConsumer;

      if (!consumer[DEPENDENCY_FIELD]) consumer[DEPENDENCY_FIELD] = new Map();
      
      consumer[DEPENDENCY_FIELD].set(ctx.name, dependency);
    });
  }
}

export function Injectable(target: Dependency, _ctx: ClassDecoratorContext<Dependency>) {
  injectables.add(target);
}