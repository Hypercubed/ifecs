import { Inject } from "../../deps.ts";
import { Module, ModuleDecorator } from "../../ecs/module.ts";
import { ActionSystem, syntax } from "../systems/action.system.ts";
import { IFModule } from "./if.module.ts";

export const YOU_CANT_SEE_IT = `You can't see any such thing.`; // TODO: actor
export const CANT_UNDERSTAND = `I don't understand that sentence.`;
export const DONT_KNOW_HOW = `I don't know how to do that.`;
export const DOES_NOT_WORK = `It doesn't seem to work.`;

@ModuleDecorator({
  requires: [
    IFModule,
  ],
})
export class WhatModule extends Module {
  @Inject(ActionSystem)
  private actionSystem!: ActionSystem;

  onInit() {
    const actionSystem = this.actionSystem;

    actionSystem.add(
      "*",
      () => CANT_UNDERSTAND,
    );

    actionSystem.add(
      syntax`#Verb *`,
      () => YOU_CANT_SEE_IT,
    );
  }
}
