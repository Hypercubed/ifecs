import { Component } from "../../ecs/components.ts";
import { Thing } from "./things.ts";
import { Location } from "./locations.ts";
import { closable, closed, fixed, openable } from "../modules/verbs/tags.ts";

class SidesComponent extends Component {
  constructor(public readonly front: Location, public readonly back: Location) {
    super();
  }
}

// TODO: one way?
export class Portal extends Thing {
  private _sides!: SidesComponent;

  constructor(name: string, match?: RegExp | string, description = name) {
    super(name, match, description);
    this.add(openable);
    this.add(closable);
    this.add(closed);
    this.add(fixed);
  }

  connects(front: Location, back: Location) {
    this._sides = new SidesComponent(front, back);
    this.add(this._sides);

    if (front) front.add(this);
    if (back) back.add(this);

    return this;
  }

  getOtherSide(location: Location) {
    return (location === this._sides.front)
      ? this._sides.back
      : this._sides.front;
  }
}
