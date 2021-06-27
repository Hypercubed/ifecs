import { Component, ComponentType } from "./components.ts";
import { Entity, EntityType } from "./entities.ts";
import { Tag } from "./tags.ts";

export type QueryPredicate<T extends Entity = Entity> = (x: T) => boolean;

/**
 * Query represents filter for entities
 */
export class Query<T extends Entity> {
  constructor(
    public readonly base: EntityType<T>,
    public readonly predicate?: QueryPredicate<T>,
  ) {
  }

  and(predicate: QueryPredicate<T>): Query<T> {
    if (this.predicate) {
      return new Query<T>(
        this.base,
        (thing: T) => this.predicate!(thing) && predicate(thing),
      );
    }
    return new Query<T>(this.base, predicate);
  }

  has(x: Tag): Query<T>;
  has<C extends Component>(x: ComponentType<C>): Query<T>;
  // deno-lint-ignore no-explicit-any
  has(x: any): Query<T> {
    return this.and((e: T) => e.has(x));
  }

  hasNot(x: Tag): Query<T>;
  hasNot<C extends Component>(x: ComponentType<C>): Query<T>;
  // deno-lint-ignore no-explicit-any
  hasNot(x: any): Query<T> {
    return this.and((e: T) => !e.has(x));
  }
}
