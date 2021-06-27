import { Entity } from "../../ecs/mod.ts";

export class Token extends Entity {
  public readonly match: RegExp | string;

  constructor(public name: string, match?: RegExp | string) {
    super();
    /* eslint-disable security/detect-non-literal-regexp */
    this.match = match || name;
  }

  toString(): string {
    return this.name;
  }

  fullMatch(s: string): boolean {
    const m = s.match(this.match as RegExp);
    if (m) return m.input?.length === m[0].length;
    return false;
  }
}
