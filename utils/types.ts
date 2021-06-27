// deno-lint-ignore no-explicit-any
export type List = ReadonlyArray<any>;

// deno-lint-ignore no-explicit-any
export type AnyFunction<T = unknown, A extends List = any[]> = (
  ...args: A
) => T;

// deno-lint-ignore no-explicit-any
export type AnyClass<T = unknown, A extends List = any[]> = new (
  ...args: A
) => T;

// deno-lint-ignore no-explicit-any
export type AnyAbstractClass<T = unknown, A extends List = any[]> =
  abstract new (
    ...args: A
  ) => T;

export function isInstanceof<U>(x: unknown, K: AnyClass<U>): x is U {
  return typeof K === "function" && x instanceof K;
}

// // deno-lint-ignore no-explicit-any
// export type AnyKey = keyof any;

// export interface AnyObject {
//   // deno-lint-ignore no-explicit-any
//   [key: string]: any;
//   // deno-lint-ignore no-explicit-any
//   [key: number]: any;
// }

export function ExtendsClass<T, R = T>(
  x: unknown,
  P: AnyClass<T> | AnyAbstractClass<T>,
): x is AnyClass<R> {
  // @ts-ignore Otherwise TS complains
  return x.prototype instanceof P;
}

// deno-lint-ignore no-explicit-any
export function cast<T>(TheClass: AnyClass<T>, obj: any): T {
  if (!(obj instanceof TheClass)) {
    throw new Error(`Not an instance of ${TheClass.name}: ${obj}`);
  }
  return obj;
}

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export type JSONValueFunction<T, R extends JSONValue = JSONValue> = (x: T) => R;

// function checkJSON(v: JSONValue): JSONValue { return v; }
