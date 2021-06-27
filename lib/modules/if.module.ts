import { Engine, Module, ModuleDecorator, SystemType } from "../../ecs/mod.ts";

import { TimeData, TimeDataSystem } from "../systems/kenetics.ts";
import { FPSDisplay } from "../systems/fps.system.ts";
import { ActionSystem } from "../systems/action.system.ts";
import { OutputSystem } from "../systems/output.system.ts";
import { Inject } from "../../deps.ts";
import { RuleSystem } from "../systems/rules.system.ts";

const DEBUG = false;

const systems: SystemType[] = [
  TimeDataSystem,
  ActionSystem,
  OutputSystem,
  RuleSystem,
];

if (DEBUG) {
  systems.push(FPSDisplay);
}

@ModuleDecorator({
  systems,
})
export class IFModule extends Module {
  @Inject(Engine)
  private engine!: Engine;

  onInit() {
    this.engine.injector.addStatic(TimeData, new TimeData());
  }
}
