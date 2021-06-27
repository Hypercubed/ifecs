import { Inject } from "../../deps.ts";
import { Module, ModuleDecorator } from "../../ecs/mod.ts";

import { ActionSystem } from "../systems/action.system.ts";
import { IFModule } from "../modules/if.module.ts";

import { WhatModule } from "./what.module.ts";
import { consuming } from "./verbs/consuming.ts";
import { dropping } from "./verbs/dropping.ts";
import { examining } from "./verbs/examining.ts";
import { locking } from "./verbs/locking.ts";
import { opening } from "./verbs/opening.ts";
import { pushing } from "./verbs/pushing.ts";
import { putting } from "./verbs/putting.ts";
import { reading } from "./verbs/reading.ts";
import { switching } from "./verbs/switching.ts";
import { taking } from "./verbs/taking.ts";
import { wearing } from "./verbs/wearing.ts";

@ModuleDecorator({
  requires: [
    IFModule,
    WhatModule,
  ],
})
export class VerbsModule extends Module {
  @Inject(ActionSystem)
  private actionSystem!: ActionSystem;

  onInit() {
    taking(this.actionSystem);
    reading(this.actionSystem);
    examining(this.actionSystem);
    dropping(this.actionSystem);
    opening(this.actionSystem);
    putting(this.actionSystem);
    switching(this.actionSystem);
    consuming(this.actionSystem);
    wearing(this.actionSystem);
    pushing(this.actionSystem);
    locking(this.actionSystem);
  }
}
