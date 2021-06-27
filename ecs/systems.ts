import { Service } from "../deps.ts";
import { Engine } from "../ecs/engine.ts";
import { Entity } from "./entities.ts";
import { Query } from "./queries.ts";

export type SystemType<T extends System = System> =
  & (new () => T)
  & typeof System;

/**
 * Systems performs global actions
 */
@Service()
export class System {
  protected _engine: Engine | undefined;

  get engine(): Engine | undefined {
    return this._engine!;
  }
  set engine(engine: Engine | undefined) {
    this._engine = engine;
  }

  /**
   * Priority of the system
   */
  priority = 0; // TODO: phases, readonly??

  /**
   * The update call
   */
  update(): void {
  }

  constructor() {
    // if (window.currentEngine) {
    //   window.currentEngine.add(this);
    // }
  }

  checkEngine(): void {
    if (!this._engine) {
      throw new Error(`System - system is not attached to an engine`);
    }
  }
}

/**
 * Iterative system made for iterating over entities that matches its query.
 */
export abstract class IterativeSystem extends System {
  public readonly query = new Query(Entity);

  update(): void {
    this.checkEngine();
    const entities = this.engine!.findEntities(
      this.query.base,
      this.query.predicate,
    );
    for (const e of entities) {
      this.updateEntity(e);
    }
  }

  /**
   * An update call for each entity macthing the query
   */
  abstract updateEntity(e: Entity): void;
}

/**
 * A group of sysyems that run togetherin a fixed order
 */
export abstract class SystemGroup extends System {
  protected readonly systems: Array<System> = [];

  set engine(engine: Engine | undefined) {
    this._engine = engine;
    for (const system of this.systems) {
      system.engine = engine;
    }
  }

  update(): void {
    this.checkEngine();
    for (const system of this.systems) {
      system.update();
    }
  }
}
