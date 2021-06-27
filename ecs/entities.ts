import { Component, ComponentType } from "./components.ts";
import { Engine } from "./engine.ts";

import { Query, QueryPredicate } from "./queries.ts";
import { Tag, TagValue } from "./tags.ts";
import {
  AnyClass,
  ExtendsClass,
  isInstanceof,
  JSONValue,
} from "../utils/types.ts";

let entityId = 1;

export type EntityType<T extends Entity = Entity> = AnyClass<T>;

/**
 * A general purpose object, which can contain components.
 */
export class Entity {
  // *** STATIC ***

  protected static _query: Query<Entity>;

  static getQuery<T extends Entity>(this: EntityType<T>): Query<T> {
    const self = this as unknown as { _query: Query<T> };
    if (!self._query) {
      self._query = new Query<T>(this);
    }
    return <Query<T>> self._query;
  }

  static filter<T extends Entity>(
    this: EntityType<T>,
    predicate: QueryPredicate<T>,
  ): Query<T> {
    return new Query<T>(this, predicate);
  }

  static has<T extends Entity>(this: EntityType<T>, x: Tag): Query<T> {
    return new Query<T>(this, (e) => e.has(x));
  }

  // *** INSTANCE ***

  public readonly id = entityId++;
  public engine: Engine | undefined;

  protected _tags = new Map<Tag, TagValue>();
  protected _components = new Map<ComponentType, Component>();

  /**
   * Gets a list of tags added to entity
   */
  get tags(): ReadonlyArray<Tag> {
    return Array.from(this._tags.keys());
  }

  // TODO: get components

  constructor() {
    if (window.currentEngine) {
      window.currentEngine.add(this);
    }
  }

  add(x: Tag, v?: TagValue): this;
  add<T extends Component>(x: T): this;
  add(x: unknown, v?: TagValue): this {
    if (x instanceof Tag) {
      this.addTag(x, v);
    } else if (x instanceof Component) {
      this.addComponent(x);
    }
    return this;
  }

  /**
   * Returns value indicating whether the entity has a specific component or tag
   *
   * @param x
   */
  has(x: Tag): boolean;
  has<T extends Component>(x: ComponentType<T>): boolean;
  has(x: unknown): boolean {
    if (x instanceof Tag) {
      return this._tags.has(x);
    }
    if (ExtendsClass<Component>(x, Component)) {
      return this._components.has(x);
    }
    return false;
  }

  /**
   * Gets a component or tag
   *
   * @param x
   */
  get<T extends JSONValue>(x: Tag<T>): T | undefined;
  get<T extends Component>(x: ComponentType<T>): T | undefined;
  get(x: unknown): unknown {
    if (x instanceof Tag) {
      return this.getTag(x);
    }
    if (ExtendsClass<Component>(x, Component)) {
      return this._components.get(x);
    }
    return undefined; // error?
  }

  /**
   * Removes a component or tag
   *
   * @param x
   */
  remove(x: Tag): this;
  remove<T extends Component>(x: ComponentType<T>): this;
  remove(x: unknown): this {
    if (x instanceof Tag) {
      this._tags.delete(x);
    }
    if (ExtendsClass<Component>(x, Component)) {
      this._components.delete(x);
    }
    return this;
  }

  /**
   * Returns value indicating whether entity have all of specified components/tags
   *
   * @param x
   * @returns
   */
  hasAll<T extends Component>(...x: Array<Tag | ComponentType<T>>): boolean {
    // deno-lint-ignore no-explicit-any
    return x.every((y) => this.has(y as any));
  }

  /**
   * Returns value indicating whether entity have any of specified components/tags
   *
   * @param x
   * @returns
   */
  hasAny<T extends Component>(...x: Array<Tag | ComponentType<T>>): boolean {
    // deno-lint-ignore no-explicit-any
    return x.some((y) => this.has(y as any));
  }

  isA<T>(K: unknown): this is T {
    return this === K || isInstanceof(this, K as AnyClass<T>);
  }

  protected addComponent<T extends Component>(x: T, X?: ComponentType<T>) {
    X ||= x.constructor as ComponentType<T>;
    this._components.set(X, x);
  }

  protected addTag(x: Tag, v?: TagValue): void {
    this._tags.set(x, v || x.defaultValue);
  }

  protected getTag(x: Tag): JSONValue | undefined {
    const r = this._tags.get(x);
    return typeof r === "function" ? r(this) : r;
  }
}
