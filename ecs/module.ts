import { Reflect, Service } from "../deps.ts";

import { Engine } from "./engine.ts";
import { SystemType } from "./systems.ts";

export type ModuleType<T extends Module = Module> =
  & (new (engine: Engine) => T)
  & typeof Module;

@Service()
export class Module {
  onInit() {
    // nop
  }
}

interface ModuleConfig {
  requires: ModuleType[];
  systems: SystemType[];
  // deno-lint-ignore no-explicit-any
  provides: any;
}

export const REQUIRES_METADATA = "__ecs:requires__";
export const SYSTEMS_METADATA = "__ecs:systems__";
export const PROVIDERS_METADATA = "__ecs:providers__";

export function ModuleDecorator(config: Partial<ModuleConfig>) {
  return function (constructor: ModuleType) {
    if (config.requires) {
      const __requires__ =
        Reflect.getMetadata(REQUIRES_METADATA, constructor) || [];
      __requires__.push(...config.requires);
      Reflect.defineMetadata(REQUIRES_METADATA, __requires__, constructor);
    }
    if (config.systems) {
      const __systems__ = Reflect.getMetadata(SYSTEMS_METADATA, constructor) ||
        [];
      __systems__.push(...config.systems);
      Reflect.defineMetadata(SYSTEMS_METADATA, __systems__, constructor);
    }
    if (config.provides) {
      const __providers__ =
        Reflect.getMetadata(PROVIDERS_METADATA, constructor) ||
        [];
      __providers__.push(...config.provides);
      Reflect.defineMetadata(PROVIDERS_METADATA, __providers__, constructor);
    }

    Service()(constructor);
  };
}
