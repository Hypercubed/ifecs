import { Inject } from "../../deps.ts";
import { Module, ModuleDecorator } from "../../ecs/mod.ts";
import { Actor } from "../entities/actors.ts";
import { Thing } from "../entities/things.ts";
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
    this.actions.add(
      syntax`use *?`,
      (you: Actor) => `${you} need to be a little more specific.`,
    );

    this.actions.add(
      syntax`smell *?`,
      (you: Actor) => `${you} don't smell anything unusual.`,
    );

    this.actions.add("wave", (you: Actor) => `${you} wave, feeling foolish.`);
    this.actions.add(
      "jump",
      (you: Actor) => `${you} jump on the spot, accomplishing little.`,
    );
    this.actions.add(
      "listen *?",
      (you: Actor) => `${you} hear nothing unexpected.`,
    );
    this.actions.add(
      "undo",
      (you: Actor) => `${you} can't undo what hasn't been done!`,
    );
    this.actions.add("think", `What a good idea.`);

    this.actions.add("(wait|z)", `Nothing happens.`);
    this.actions.add(/sleep/, `Not now--there's work to be done.`);

    this.actions.add("(say|yell|shout) *", `There is no reply.`);

    this.actions.add(
      syntax`throw *?`,
      (you: Actor) => `${you} decide that's not a great idea.`,
    );
    this.actions.add(`climb *?`, `Not here; not now.`);
    this.actions.add("kiss *?", (you: Actor) => `${you} need to get out more.`);
    this.actions.add("swim *?", `Not here.`);
    this.actions.add(
      "touch *?",
      `That probably isn't the best use of your time.`,
    );
    this.actions.add("burn *?", `Don't play with fire.`);
    this.actions.add("dig *?", `That won't accomplish anything.`);
  }
}
