import { Inject, Service } from "../../deps.ts";
import { System, Tag } from "../../ecs/mod.ts";
import { Player } from "../entities/actors.ts";

export const score = new Tag("if-score", 0);

@Service()
export class ScoreSystem extends System {
  @Inject(Player)
  private player!: Player;

  private _oldScore = 0;

  get score() {
    return this.player.get(score)!;
  }
  set score(val: number) {
    this.player.add(score, val);
  }

  priority = +100;

  update() {
    if (!this.player.has(score)) return;
    if (this.score > this._oldScore) {
      const ds = this.score - this._oldScore;
      if (ds > 0) {
        this.player.say(
          `[Your score has just gone up by ${getPointsText(ds)}.]`,
        );
      } else {
        this.player.say(
          `[Your score has just gone down by ${getPointsText(-ds)}.]`,
        );
      }
      this._oldScore = this.score;
    }
  }

  addPoint() {
    this.score++;
  }
}

function getPointsText(n: number) {
  switch (n) {
    case 1:
      return "one point";
    case 2:
      return "two points";
    case 3:
      return "three points";
    default:
      return `${n} points`;
  }
}
