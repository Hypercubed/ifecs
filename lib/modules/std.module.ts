import { DirectionsModule } from "./directions.module.ts";
import { PlayerModule } from "./player.module.ts";
import { LocationsModule } from "./locations.module.ts";
import { VerbsModule } from "./verbs.module.ts";
import { ThingsModule } from "./things.module.ts";
import { IFModule } from "../modules/if.module.ts";
import { TurnsScoreModule } from "./turns-score.module.ts";
import { Module, ModuleDecorator } from "../../ecs/module.ts";
import { WhatModule } from "./what.module.ts";
import { StubModule } from "./stub.module.ts";

@ModuleDecorator({
  requires: [
    IFModule,
    WhatModule,
    StubModule,
    ThingsModule,
    PlayerModule,
    DirectionsModule,
    LocationsModule,
    VerbsModule,
    TurnsScoreModule,
  ],
})
export class StdLib extends Module {
}
