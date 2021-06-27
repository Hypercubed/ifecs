import { Module, ModuleDecorator } from "../../ecs/mod.ts";

import { ActionSystem } from "../systems/action.system.ts";
import { Actor } from "../entities/actors.ts";
import { IFModule } from "../modules/if.module.ts";
import { Inject } from "../../deps.ts";

@ModuleDecorator({
  requires: [
    IFModule,
  ],
})
export class LocationsModule extends Module {
  @Inject(ActionSystem)
  private actionSystem!: ActionSystem;

  onInit() {
    this.actionSystem.add(
      "(l|look)",
      (actor: Actor) => actor.look(),
    );
  }
}
