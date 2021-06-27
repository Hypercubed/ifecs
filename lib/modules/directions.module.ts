import { Module, ModuleDecorator } from "../../ecs/mod.ts";

import { ActionSystem, syntax } from "../systems/action.system.ts";

import { LocationsModule } from "./locations.module.ts";
import { IFModule } from "../modules/if.module.ts";

import { Actor } from "../entities/actors.ts";
import { Direction } from "../entities/directions.ts";
import { Portal } from "../entities/portals.ts";
import { Inject } from "../../deps.ts";
import { YOU_CANT_SEE_IT } from "./what.module.ts";
import { cannotGo, closed, onEnter, visited } from "./verbs/tags.ts";

@ModuleDecorator({
  requires: [
    IFModule,
    LocationsModule,
  ],
})
export class DirectionsModule extends Module {
  @Inject(ActionSystem)
  private actionSystem!: ActionSystem;

  north = new Direction("North", "(north|n)");
  south = new Direction("South", "(south|s)");
  west = new Direction("West", "(west|w)");
  east = new Direction("East", "(east|e)");
  up = new Direction("West", "(up|u)");
  down = new Direction("East", "(down|d)");
  into = new Direction("In", "(in)");
  outof = new Direction("Out", "(out)");

  onInit() {
    const actionSystem = this.actionSystem;

    // Actions
    actionSystem.add(
      "go .",
      () => YOU_CANT_SEE_IT,
    );

    actionSystem.add(
      syntax`go? ${Direction}`,
      (you: Actor, direction: Direction): string => {
        if (!you.canMove(direction)) return `${you} can't go that way.`;
        let location = you.container!.get(direction)!;
        if (location instanceof Portal) {
          if (location.has(closed)) return `The ${location} is closed.`;
          location = location.getOtherSide(you.container!);
        }
        if (location.has(cannotGo)) {
          return location.get(cannotGo) ||
            `${you} will have to go back the way you came.`;
        }
        you.moveTo(location);
        if (location.has(onEnter)) {
          you.say(location.get(onEnter)!);
        }
        location.add(visited);
        return you.look();
      },
    );
  }
}
