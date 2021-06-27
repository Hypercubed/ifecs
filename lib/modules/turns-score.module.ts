import { Engine, Module, ModuleDecorator, SystemType } from "../../ecs/mod.ts";

import { PlayerModule } from "./player.module.ts";

import { Actor, Player } from "../entities/actors.ts";
import { score, ScoreSystem } from "../systems/score.system.ts";
import { turns, TurnsSystem } from "../systems/turns.system.ts";
import { ScoreBoardSystem } from "../systems/score-board.system.ts";
import { ActionSystem } from "../systems/action.system.ts";
import { IFModule } from "./if.module.ts";
import { Inject } from "../../deps.ts";

const systems: SystemType[] = [
  TurnsSystem,
  ScoreSystem,
];

if (!("__test_env__" in window)) {
  systems.push(ScoreBoardSystem);
}

@ModuleDecorator({
  requires: [
    IFModule,
    PlayerModule,
  ],
  systems,
})
export class TurnsScoreModule extends Module {
  @Inject(ActionSystem)
  private actions!: ActionSystem;

  @Inject(Player)
  private player!: Player;

  onInit() {
    this.player
      .add(score)
      .add(turns);

    this.actions.add(
      `score`,
      (actor: Actor) => `Your current score is ${actor.get(score)}.`,
    );
  }
}
