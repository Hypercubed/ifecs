import { Query } from "../../../ecs/queries.ts";
import { Actor } from "../../entities/actors.ts";
import { Token } from "../../entities/tokens.ts";

export type NonQuery = string | RegExp;

// deno-lint-ignore no-explicit-any
export type InputKey<T extends Token = any> =
  | Token
  | typeof Token
  | Query<T>
  | NonQuery;

type ResolveKey<K> = K extends string | RegExp ? string
  : K extends Token ? K
  : K extends typeof Token ? InstanceType<K>
  : K extends Query<infer T> ? T
  : K;

export type ResolveTuple<A extends InputKey[]> = {
  [P in keyof A]: ResolveKey<A[P]>;
};

export interface ISyntax<A extends InputKey[] = InputKey[]> {
  keys: A;
  strings: string[];
  matcher: string;
}

export type GivenFunction = (
  actor: Actor,
) => boolean;

export type WhenFunction<A extends InputKey[]> = (
  actor: Actor,
) => Partial<ISyntax<A>>;

export type ThenFunction<A extends InputKey[]> = (
  actor: Actor,
  ...args: ResolveTuple<A>
) => string | boolean;

export interface Action<A extends InputKey[] = InputKey[]> {
  when: WhenFunction<A>;
  then: ThenFunction<A>;
}
