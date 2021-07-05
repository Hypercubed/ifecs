import { Inject, Service } from "../deps.ts";
import { inverse, tty } from "./deps.ts";

import { System } from "../ecs/mod.ts";
import { consoleSize } from "../utils/console.ts";

import { Player } from "../lib/entities/actors.ts";
import { score } from "../lib/systems/score.system.ts";
import { turns } from "../lib/systems/turns.system.ts";

@Service()
export class ScoreBoardSystem extends System {
  priority = Infinity;

  @Inject(Player)
  private player!: Player;

  private lastBar = ``;

  getBar() {
    const location = this.player.container ? `${this.player.container}` : "";
    const _score = this.player.has(score)
      ? `Score: ${this.player.get(score)}`
      : "";
    const _turns = this.player.has(turns)
      ? `Moves: ${this.player.get(turns)}`
      : "";

    const s = `   ${location}    ${_score}    ${_turns}   `;
    const columns = consoleSize().columns;
    const r = columns - s.length;
    if (r <= 0) return s.slice(0, columns);
    return `   ${location} ${" ".repeat(r)}   ${_score}    ${_turns}   `;
  }

  update() {
    const text = this.getBar();
    if (text !== this.lastBar) {
      tty.writeSync(tty.SAVE, Deno.stdout);
      tty.goToSync(1, 2);
      tty.writeSync(inverse(text), Deno.stdout);
      tty.writeSync(tty.RESTORE, Deno.stdout);

      this.lastBar = text;
    }
  }
}
