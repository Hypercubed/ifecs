import { JSONValue, JSONValueFunction } from "../utils/types.ts";
import { Entity } from "./entities.ts";

let tagId = 1;

export type TagValue<
  T extends JSONValue = JSONValue,
  E extends Entity = Entity,
> = T | JSONValueFunction<E, T>;

/**
 * A tag is the simplest form of component.  Containing only serializable data or functions that return serializable data
 */
export class Tag<T extends JSONValue = JSONValue> {
  public readonly id = tagId++;
  public readonly name: string;
  public readonly defaultValue: TagValue<T>;

  constructor(name?: string, defaultValue?: TagValue<T>) {
    this.name = name || String(this.id);
    if (typeof defaultValue == "undefined") {
      defaultValue = true as unknown as TagValue<T>;
    }
    this.defaultValue = defaultValue;
  }

  toString(): string {
    return this.name;
  }

  isA(K: unknown): boolean {
    return K === this;
  }
}
