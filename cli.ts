#!/usr/bin/env -S deno run --unstable --allow-all

import { Engine } from "./ecs/engine.ts";
import { CloakGame } from "./examples/cloak.ts";
import { PhysicsExample } from "./examples/physics.ts";
import { FPSDisplay } from "./lib/systems/fps.system.ts";
import { run } from "./runner/mod.ts";

run(CloakGame);

const intro = new Engine()
  .include(PhysicsExample)
  .initialize();

intro.removeSystemType(FPSDisplay);

intro.loop(15);
