import {
  Component,
  ComponentType,
  ContainedComponent,
  EntityType,
  Query,
  SetComponent,
  Tag,
  TagValue,
} from "../../ecs/mod.ts";
import { nlp } from "../../deps.ts";
import { ExtendsClass } from "../../utils/types.ts";
import { Actor } from "./actors.ts";

import { Token } from "./tokens.ts";

import {
  closed,
  contentsAccessible,
  contentsVisible,
  droppable,
  examinable,
  fixed,
  hidden,
  inventoriable,
  lookable,
  portable,
} from "../modules/verbs/tags.ts";

// TODO: split into Thing and Item?
// TODO: add junk/scenery?
export class Thing extends Token {
  static seenBy<T extends Thing>(
    this: EntityType<T>,
    actor: Actor,
  ): Query<T> {
    return new Query<T>(this, (thing: T) => actor.sees(thing));
  }

  static hadBy<T extends Thing>(
    this: EntityType<T>,
    actor: Actor,
  ): Query<T> {
    return new Query<T>(this, (thing: T) => actor.hasAccessibleChild(thing));
  }

  static accessibleBy<T extends Thing>(
    this: EntityType<T>,
    actor: Actor,
  ): Query<T> {
    return new Query<T>(this, (thing: T) => actor.accessible(thing));
  }

  private containedByComponent = new ContainedComponent<Composite>(null);

  readonly name: string;
  readonly description: string;

  get container(): Composite | null { // aka Parent
    return this.containedByComponent.container;
  }
  set container(val: Composite | null) {
    this.containedByComponent.container = val;
  }

  // TODO: siblings

  constructor(name: string, match?: RegExp | string, description = name) {
    super(name, match);
    this.description = description;
    this.name = name;

    this.add(this.containedByComponent);

    this.add(lookable); // use scenery
    this.add(inventoriable); // the default
    this.add(portable); // use fixed?
    this.add(droppable); // the default
    this.add(examinable); // the default
  }

  isIn(container: Composite): boolean {
    return this.container === container ||
      Boolean(this.container?.isIn(container));
  }

  moveTo(container: Composite | null): this {
    // TODO: check for circular containers
    const location = this.container;
    if (location) location.remove(this);
    if (container) container.add(this);
    this.container = container;
    return this;
  }

  getAll(x: typeof Tag): Array<Tag> {
    if (x === Tag) {
      return Array.from(this._tags.keys());
    }
    if (ExtendsClass(x, Tag)) {
      return Array.from(this._tags.keys()).filter((y) => y.isA(x));
    }
    return []; // error?
  }

  toString(): string {
    return this.name;
  }
}

class ContainsComponent extends SetComponent<Thing> {
}

export class LockedByComponent extends SetComponent<Thing> {
}

export class Composite extends Thing {
  protected containsComponent = new ContainsComponent();

  get contents() { /// aka children
    return Array.from(this.containsComponent);
  }

  constructor(name: string, match?: RegExp | string, description = name) {
    super(name, match, description);
    this.add(this.containsComponent);
    this.add(contentsAccessible, true);
    this.add(contentsVisible, true);
  }

  add(x: Tag, v?: TagValue): this;
  add<T extends Component>(x: T): this;
  add(x: unknown, v?: unknown): this {
    if (x instanceof Thing) {
      this.containsComponent.add(x);
      return this;
    }
    return super.add(x as Tag, v as TagValue);
  }

  has(x: Thing | Tag): boolean;
  has<T extends Component>(x: ComponentType<T>): boolean;
  has(x: unknown): boolean {
    if (x instanceof Thing) {
      return this.containsComponent.has(x);
    }
    return super.has(x as Tag);
  }

  hasChild(x: Thing): boolean {
    if (this.containsComponent.has(x)) return true;
    return this.contents.some((y) => y instanceof Composite && y.hasChild(x));
  }

  hasAccessibleChild(x: Thing): boolean {
    if (x === this) return false;
    if (x.has(hidden)) return false;
    if (!this.get(contentsAccessible)) return false;
    if (this.containsComponent.has(x)) return true;
    return this.contents.some((y) =>
      y instanceof Composite && y.hasAccessibleChild(x)
    );
  }

  hasVisibleChild(x: Thing): boolean {
    if (x.has(hidden)) return false;
    if (!this.get(contentsVisible)) return false;
    if (this.containsComponent.has(x)) return true;
    return this.contents.some((y) =>
      y instanceof Composite && y.hasVisibleChild(x)
    );
  }

  remove(x: Thing | Tag): this;
  remove<T extends Component>(x: ComponentType<T>): this;
  remove(x: unknown): this {
    if (x instanceof Thing) {
      this.containsComponent.delete(x);
      return this;
    }
    return super.remove(x as Tag);
  }

  getAll(x: typeof Tag): Tag[];
  getAll(x: EntityType<Thing>): Thing[];
  getAll(x: unknown): unknown[] {
    if (x === Thing) {
      return this.contents;
    }
    if (ExtendsClass<Thing>(x, Thing)) {
      return this.contents.filter((y) => y.isA(x));
    }
    return super.getAll(x as typeof Tag);
  }
}

export class Container extends Composite {
  constructor(name: string, match?: RegExp | string, description = name) {
    super(name, match, description);

    this.add(contentsAccessible, () => !this.has(closed));
    this.add(contentsVisible, () => !this.has(closed));

    this.add(lookable, () => {
      let r = this.description;
      const visibleContents = this.contents.filter((t) =>
        this.hasVisibleChild(t)
      );
      if (visibleContents.length > 0) {
        r += ` The ${this.name} contains: ${visibleContents.join(", ")}.`;
      }
      return r;
    });

    this.add(inventoriable, () => {
      let r = this.description;
      const visibleContents = this.contents.filter((t) =>
        this.hasVisibleChild(t)
      );
      if (visibleContents.length) {
        const counts = visibleContents.reduce((acc, item) => {
          const s = String(item);
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const items = Object.keys(counts).map((k) => {
          if (counts[k] === 1) return k;
          return nlp(`${counts[k]} ${k}`).nouns().toPlural().parent().text();
        });
        r += ` The ${this.name} contains: ${items.join(", ")}.`;
      }
      return r;
    });
  }
}

export class Supporter extends Composite {
  constructor(name: string, match?: RegExp | string, description = name) {
    super(name, match, description);

    this.add(fixed);

    this.add(lookable, () => {
      let r = `${this.description}.`;
      const visibleContents = this.contents.filter((t) =>
        this.hasVisibleChild(t)
      );
      if (visibleContents.length) {
        r += `  On the ${this.name}: ${visibleContents.join(", ")}.`;
      }
      return r;
    });
  }
}
