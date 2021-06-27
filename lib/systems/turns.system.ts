import { Inject, Service } from "../../deps.ts";
import { Entity, IterativeSystem, Tag } from "../../ecs/mod.ts";

import { Player } from "../entities/actors.ts";
import { actionQueue } from "./action.system.ts";

export const turns = new Tag("if-turn", 0);

@Service()
export class TurnsSystem extends IterativeSystem {
  public readonly query = Player.getQuery<Entity>();

  @Inject(Player)
  private player!: Player;

  get turns() {
    return this.player.get(turns)!;
  }

  priority = -100;

  updateEntity(actor: Player) {
    if (actor.has(actionQueue) && actor.get(actionQueue)!.length > 0) {
      const t = actor.get(turns) || 0;
      actor.add(turns, t + 1);
    }
  }
}
