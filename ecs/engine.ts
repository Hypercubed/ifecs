import { Reflect, ServiceCollection } from "../deps.ts";

import { ExtendsClass } from "../utils/types.ts";
import { Signal } from "../deps.ts";

import { Entity, EntityType } from "./entities.ts";
import { QueryPredicate } from "./queries.ts";
import { System, SystemType } from "./systems.ts";
import {
  Module,
  ModuleType,
  PROVIDERS_METADATA,
  REQUIRES_METADATA,
  SYSTEMS_METADATA,
} from "./module.ts";
import { ServiceIdent } from "https://deno.land/x/di@v0.1.1/service.ts";

declare global {
  interface Window {
    currentEngine: Engine | undefined;
    engineStack: Engine[];
  }
}

window.engineStack = [];

/**
 * Engine manages game state, and provides the update loop.
 */
export class Engine {
  protected _initialized = false;
  protected _running = false;
  protected _paused = false;
  protected _requestUpdate = false;
  protected _updating = false;

  protected _systems: System[] = [];
  protected _entities: Entity[] = []; // TODO: Make a set?

  protected _classCache = new Map<EntityType, Array<Entity>>();

  protected _toInitModules = new Set<ModuleType>();
  protected _toInitSystems = new Set<SystemType>();

  public readonly injector = new ServiceCollection();

  private timer = 0;

  // Signals
  public readonly onStart = new Signal<[void]>();
  public readonly onEnd = new Signal<[void]>();

  // TODO
  // onBeforeUpdate = new Signal<[void]>();
  // onAfterUpdate = new Signal<[void]>();

  get running(): boolean {
    return this._running;
  }

  /**
   * Gets a list of systems added to engine
   */
  get systems(): ReadonlyArray<System> {
    return Array.from(this._systems);
  }

  /**
   * Gets a list of entities added to engine
   */
  get entities(): ReadonlyArray<Entity> {
    return Array.from(this._entities);
  }

  constructor() {
    this.injector.addStatic(Engine, this);
  }

  initialize() {
    if (window.currentEngine) window.engineStack.push(window.currentEngine);
    window.currentEngine = this;

    // TODO: toposort??
    this._toInitModules.forEach((M) => {
      this.addModule(this.injector.get(M));
    });

    // TODO: toposort??
    this._toInitSystems.forEach((S) => {
      this.addSystem(this.injector.get(S));
    });

    window.currentEngine = window.engineStack.pop();

    this._toInitModules.clear();
    this._toInitSystems.clear();
    this._initialized = true;

    return this;
  }

  start() {
    if (!this._initialized) this.initialize();
    if (this._running) return this;
    this._running = true;
    this.update();
    this.onStart.dispatch();
    this.update();
    return this;
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    clearTimeout(this.timer);
    this.onEnd.dispatch();
  }

  loop(fps = 30) {
    const delay = 1 / fps * 1000;

    if (!this._running) {
      this.start();
    }
    this._paused = false;
    const _loop = () => {
      if (this.update()) this.timer = setTimeout(_loop, delay);
    };
    _loop();

    return this;
  }

  pause() {
    this._paused = true;
    clearTimeout(this.timer);
  }

  update() {
    do {
      this._requestUpdate = false;
      this._updating = true;
      for (const system of this._systems) {
        system.update();
      }
    } while (this._requestUpdate);
    this._updating = false;
    return this._running && !this._paused;
  }

  requestUpdate() {
    if (this._updating) {
      this._requestUpdate = true;
    } else {
      this.update();
    }
  }

  include<R extends Module>(M: ModuleType<R>): this {
    if (this._initialized) throw `Engine already initialized`;
    this.includeModule(M);
    return this;
  }

  add(...x: Array<System | Entity>): this {
    x.forEach((y) => {
      if (y instanceof Entity) return this.addEntity(y);
      if (y instanceof System) return this.addSystem(y); // TODO: remove this, systems added using modules?
      throw new Error(`Engine#add - Unrecognized type ${y}`);
    });
    return this;
  }

  remove(x: System | Entity): boolean {
    if (x instanceof Entity) return this.removeEntity(x);
    if (x instanceof System) return this.removeSystem(x);
    throw new Error(`Engine#remove - Unrecognized type`);
  }

  removeSystemType(x: SystemType): boolean {
    this._systems = this._systems.filter((y) => !(y instanceof x));
    return true;
  }

  has(x: System | Entity): boolean {
    if (x instanceof Entity) return this._entities.includes(x);
    if (x instanceof System) return this._systems.includes(x);
    throw new Error(`Engine#has - Unrecognized type`);
  }

  get<T extends Module>(x: ModuleType<T>): T | undefined;
  get<T extends Entity>(x: EntityType<T>): T | undefined; // TODO: this is weird, in general entities are not singletons
  get<T extends System>(x: SystemType<T>): T | undefined;
  get(x: unknown): unknown | undefined {
    // if (ExtendsClass(x, System)) {
    //   return this._systems.find((s) => s instanceof x);
    // }
    if (ExtendsClass(x, Entity)) {
      return this.findEntities(x as EntityType)[0];
    }
    return this.injector.get(x as ServiceIdent<unknown>); // error?
  }

  findEntities<T extends Entity>(
    Type: EntityType<T>,
    predicate?: QueryPredicate<T>,
  ): ReadonlyArray<T> {
    const entities = this.getEntitiesByType<T>(Type);
    return predicate ? entities.filter(predicate) : entities;
  }

  destroy() {
    this._running = false;
    clearTimeout(this.timer);
    this._systems = [];
    this._entities = [];
    this._classCache.clear();
  }

  protected includeModule<R extends Module>(M: ModuleType<R>) {
    if (this._toInitModules.has(M)) return this;

    if (Reflect.hasMetadata(REQUIRES_METADATA, M)) {
      Reflect.getMetadata(REQUIRES_METADATA, M).forEach((M: ModuleType) => {
        this.includeModule(M);
      });
    }

    this.injector.addSingleton(M);
    this._toInitModules.add(M);

    if (Reflect.hasMetadata(SYSTEMS_METADATA, M)) {
      Reflect.getMetadata(SYSTEMS_METADATA, M).forEach((S: SystemType) => {
        this.injector.addSingleton(S);
        this._toInitSystems.add(S);
      });
    }

    if (Reflect.hasMetadata(PROVIDERS_METADATA, M)) {
      // deno-lint-ignore no-explicit-any
      Reflect.getMetadata(PROVIDERS_METADATA, M).forEach((P: any) => {
        this.injector.addSingleton(P);
      });
    }
  }

  protected getEntitiesByType<T extends Entity>(
    T: EntityType,
  ): ReadonlyArray<T> {
    if (this._classCache.has(T)) return this._classCache.get(T)! as T[];
    const entities = Array.from(this._entities).filter((e: Entity) =>
      e instanceof T
    ) as T[];
    this._classCache.set(T, entities);
    return entities;
  }

  protected addModule(module: Module) {
    module.onInit();
    if ("onStart" in module!) {
      // @ts-ignore onStart
      this.onStart.subscribe(() => module.onStart());
    }
    if ("onEnd" in module!) {
      // @ts-ignore onEnd
      this.onEnd.subscribe(() => module.onEnd());
    }
  }

  protected addSystem(system: System) {
    if (this._systems.includes(system)) return this;
    system.engine = this;
    this._systems.push(system);
    // TODO: phases instead of numbers?
    this._systems = this._systems.sort((a, b) => a.priority - b.priority);
  }

  protected removeSystem(system: System) {
    if (!this._systems.includes(system)) return false;
    this._systems = this._systems.filter((y) => y !== system);
    system.engine = undefined;
    return true;
  }

  protected addEntity(entity: Entity) {
    if (this._entities.includes(entity)) return;
    if (entity.engine) {
      throw new Error(`Engine#add - Entity already exists in another engine`);
    }
    entity.engine = this;
    this._entities.push(entity);

    // Update caches
    this._classCache.forEach((e, k) => {
      if (entity instanceof k) {
        e.push(entity);
      }
    });
  }

  protected removeEntity(entity: Entity) {
    if (!this._entities.includes(entity)) {
      throw new Error(`Engine#add - Entity does not exists in this engine`);
    }
    entity.engine = undefined;
    this._entities = this._entities.filter((y) => y !== entity);

    // Update caches
    this._classCache.forEach((e) => {
      e = e.filter((y) => y !== entity);
    });

    return true;
  }
}
