import { Module, ModuleDecorator } from "../../ecs/mod.ts";

import { IFModule } from "../modules/if.module.ts";
import { WhatModule } from "./what.module.ts";

@ModuleDecorator({
  requires: [
    IFModule,
    WhatModule,
  ],
})
export class ThingsModule extends Module {
  onInit() {
  }
}
