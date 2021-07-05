import { actionQueue } from "../systems/action.system.ts";
import { nlp, Service } from "../../deps.ts";

import { Composite, Thing } from "./things.ts";
import { Location } from "./locations.ts";
import { Direction } from "./directions.ts";
import { Portal } from "./portals.ts";
import {
  darkness,
  fixed,
  heading,
  hidden,
  lookable,
  scenery,
} from "../modules/verbs/tags.ts";
import { outputQueue } from "../components/output-queue.component.ts";

export class Actor extends Composite {
  get container(): Location | null {
    return super.container as Location | null;
  }
  set container(val: Location | null) {
    super.container = val;
  }

  constructor(
    name: string,
    match?: string | RegExp | undefined,
    description?: string,
  ) {
    super(name, match, description);
    this.add(fixed);
  }

  say(...args: string[]) {
    if (!this.has(outputQueue)) {
      this.add(outputQueue);
    }
    this.get(outputQueue)!.push(args);
    return this;
  }

  do(line: string) {
    line = line.trim().toLowerCase();
    if (!line) return;
    const actions = this.get(actionQueue) || [];

    // Adds each phrase bottom the command queue
    nlp(line)
      // .normalize("heavy")
      .forEach((phrase) => {
        actions.push(phrase.text("reduced"));
      });

    this.add(actionQueue, actions);
    this.engine!.update();
    return this;
  }

  isIn(location: Location): boolean {
    return super.isIn(location);
  }

  /** Item is nearby, visible, and accessible */
  accessible(item: Thing): boolean {
    if (item === this) return false;
    if (item.has(hidden)) return false;
    if (this.hasAccessibleChild(item)) return true;
    if (this.container && this.container.hasAccessibleChild(item)) return true; // TODO: accessibility ceiling rule
    return false;
  }

  /** Item is nearby */
  near(item: Thing): boolean {
    if (this.hasChild(item)) return true;
    if (this.container && this.container.hasChild(item)) return true;
    return false;
  }

  // TODO: light
  /** Item is nearby and visible */
  sees(item: Thing): boolean {
    if (item === this) return true;
    if (item.has(hidden)) return false;
    if (this.hasVisibleChild(item)) return true;
    if (this.container && this.container.hasVisibleChild(item)) return true; // TODO: visibility ceiling rule
    return false;
  }

  canMove(direction: Direction): boolean {
    if (!this.container) return false;
    if (!this.container.get(direction)) return false;
    return !this.container.get(direction)?.has(hidden);
  }

  move(direction: Direction): Location {
    const location = this.container!;
    let exit = location.get(direction)!;
    if (exit instanceof Portal) {
      exit = exit.getOtherSide(this.container!);
    }
    this.moveTo(exit);
    return location;
  }

  look() {
    const room = this.container;
    if (!room) return `Nothing. ${this} are nowhere.`;
    if (room.has(darkness)) {
      return `It is pitch dark, and ${
        String(this).toLowerCase()
      } can't see a thing.`;
    }
    let desc = `${`-= ${room.get(heading)} =-`}\n${room.get(lookable)}`;
    room.getAll(Thing).filter((t) => t !== this).forEach(
      (thing: Thing) => {
        if (thing.has(hidden) || thing.has(scenery)) return;
        desc += "\n" + thing.get(lookable)!;
      },
    );
    return desc;
  }
}

@Service()
export class Player extends Actor {
  constructor(
    name = "You",
    match = "(i|me|you|yourself|myself|self)",
    description = name,
  ) {
    super(name, match, description);
  }
}
