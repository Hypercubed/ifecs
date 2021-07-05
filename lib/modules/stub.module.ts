import { Inject } from "../../deps.ts";
import { Module, ModuleDecorator } from "../../ecs/mod.ts";
import { Actor } from "../entities/actors.ts";
import { ActionSystem, syntax } from "../systems/action.system.ts";
import { IFModule } from "./if.module.ts";
import { WhatModule } from "./what.module.ts";

@ModuleDecorator({
  requires: [
    IFModule,
    WhatModule,
  ],
})
export class StubModule extends Module {
  @Inject(ActionSystem)
  private actions!: ActionSystem;

  onInit() {
    const actionSystem = this.actions;

    actionSystem.add(
      syntax`use *?`,
      (you: Actor) => `${you} need to be a little more specific.`,
    );

    actionSystem.add(
      syntax`smell *?`,
      (you: Actor) => `${you} don't smell anything unusual.`,
    );

    actionSystem.add("wave", (you: Actor) => `${you} wave, feeling foolish.`);
    actionSystem.add(
      "jump",
      (you: Actor) => `${you} jump on the spot, accomplishing little.`,
    );
    actionSystem.add(
      "listen *?",
      (you: Actor) => `${you} hear nothing unexpected.`,
    );
    actionSystem.add(
      "undo",
      (you: Actor) => `${you} can't undo what hasn't been done!`,
    );
    actionSystem.add("think", `What a good idea.`);

    actionSystem.add("(wait|z)", `Nothing happens.`);
    actionSystem.add(/sleep/, `Not now--there's work to be done.`);

    actionSystem.add("(say|yell|shout) *", `There is no reply.`);

    actionSystem.add(
      syntax`throw *?`,
      (you: Actor) => `${you} decide that's not a great idea.`,
    );
    actionSystem.add(`climb *?`, `Not here; not now.`);
    actionSystem.add("kiss *?", (you: Actor) => `${you} need to get out more.`);
    actionSystem.add("swim *?", `Not here.`);
    actionSystem.add(
      "touch *?",
      `That probably isn't the best use of your time.`,
    );
    actionSystem.add("burn *?", `Don't play with fire.`);
    actionSystem.add("dig *?", `That won't accomplish anything.`);
  }
}
