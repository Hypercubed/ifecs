import { AnyClass } from "../utils/types.ts";

let componentId = 1;

export type ComponentType<T extends Component = Component> =
  & AnyClass<T>
  & typeof Component;

/**
 * A base component
 */
export class Component {
  public readonly id = componentId++;
}

/**
 * A component that acts like a set
 */
export class SetComponent<T> extends Component implements Set<T> {
  private _set = new Set<T>();

  get size() {
    return this._set.size;
  }

  constructor(iterable?: Iterable<T> | null | undefined) {
    super();
    this._set = new Set<T>(iterable);
  }

  add(x: T): this {
    this._set.add(x);
    return this;
  }

  delete(x: T) {
    return this._set.delete(x);
  }

  has(x: T) {
    return this._set.has(x);
  }

  clear() {
    this._set.clear();
  }

  keys() {
    return this._set.keys();
  }
  values() {
    return this._set.values();
  }
  entries() {
    return this._set.entries();
  }

  [Symbol.iterator]() {
    return this._set[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return this._set[Symbol.toStringTag];
  }

  // deno-lint-ignore no-explicit-any
  forEach(cb: (value: T, value2: T, set: Set<T>) => void, context: any) {
    this._set.forEach(cb, context);
  }
}

/**
 * A component that acts like a map
 */
export class MapComponent<K, V> extends Component implements Map<K, V> {
  private _map = new Map<K, V>();

  get size() {
    return this._map.size;
  }

  set(x: K, y: V) {
    this._map.set(x, y);
    return this;
  }

  get(x: K) {
    return this._map.get(x);
  }

  delete(x: K) {
    return this._map.delete(x);
  }

  clear() {
    this._map.clear();
  }

  has(x: K) {
    return this._map.has(x);
  }

  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.values();
  }
  entries() {
    return this._map.entries();
  }

  // deno-lint-ignore no-explicit-any
  forEach(cb: (value: V, key: K, map: Map<K, V>) => void, context: any) {
    return this._map.forEach(cb, context);
  }

  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return this._map[Symbol.toStringTag];
  }
}

export class ContainedComponent<T> extends Component {
  constructor(public container: T | null) {
    super();
    this.container ||= null;
  }
}
