import {
  Component,
  ComponentType,
  MapComponent,
  Tag,
  TagValue,
} from "../../ecs/mod.ts";
import { JSONValue } from "../../utils/types.ts";

import { Composite, Thing } from "./things.ts";
import { Direction } from "./directions.ts";
import { Portal } from "./portals.ts";
import { heading, lookable } from "../modules/verbs/tags.ts";

export class Location extends Composite {
  private mapComponent = new MapComponent<Direction, Location | Portal>();

  get exits(): [Direction, Location | Portal][] {
    return Array.from(this.mapComponent);
  }

  constructor(name: string, description = name) {
    super(name, undefined, description);
    this.add(heading, name);
    this.add(lookable, description);
    this.add(this.mapComponent);
  }

  has(x: Direction | Thing | Tag): boolean;
  has<T extends Component>(x: ComponentType<T>): boolean;
  has(x: unknown): boolean {
    if (x instanceof Direction) {
      return this.mapComponent.has(x);
    }
    return super.has(x as Tag | Thing);
  }

  remove(x: Direction | Thing | Tag): this;
  remove<T extends Component>(x: ComponentType<T>): this;
  remove(x: unknown): this {
    if (x instanceof Direction) {
      this.mapComponent.delete(x);
      return this;
    }
    return super.remove(x as Tag | Thing);
  }

  get(x: Direction): Location | Portal | undefined;
  get<T extends JSONValue>(x: Tag): T | undefined;
  get<T extends Component>(x: ComponentType<T>): T | undefined;
  get(x: unknown): unknown {
    if (x instanceof Direction) {
      return this.mapComponent.get(x);
    }
    return super.get(x as Tag);
  }

  add(x: Direction, v: Location | Portal): this;
  add<T extends Component>(x: T): this;
  add(x: Tag, v?: TagValue): this;
  add(x: unknown, v?: unknown) {
    if (x instanceof Direction) {
      this.mapComponent.set(x, v as Location);
      return this;
    }
    return super.add(x as Tag, v as TagValue);
  }

  getExit(direction: Direction): Location | undefined {
    return this.mapComponent.get(direction) as Location;
  }
}
