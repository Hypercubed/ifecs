import { Engine, Module, ModuleDecorator } from "../../ecs/mod.ts";

import { ActionSystem } from "../systems/action.system.ts";

import { IFModule } from "../modules/if.module.ts";

import { Actor, Player } from "../entities/actors.ts";
import { Inject } from "../../deps.ts";
import { inventoriable } from "./verbs/tags.ts";

@ModuleDecorator({
  requires: [
    IFModule,
  ],
})
export class PlayerModule extends Module {
  @Inject(ActionSystem)
  private actions!: ActionSystem;

  @Inject(Engine)
  private engine!: Engine;

  onInit() {
    this.engine.injector.addStatic(Player, new Player());
    playerLib(this.actions);
  }
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function playerLib(actionSystem: ActionSystem) {
  // INVENTORY
  actionSystem.add(
    "(inventory|inv|i)",
    (actor: Actor) => {
      const visibleContents = actor.contents.filter((t) =>
        actor.hasVisibleChild(t) && t.has(inventoriable)
      );
      if (!visibleContents.length) return `${actor} are empty handed.`;
      const list = visibleContents.map((c) => c.get(inventoriable)).join(`\n `);
      return `${actor} are carrying:\n ${list}`; // TODO: look into carried containers?
    },
  );
}
