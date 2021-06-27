import { Service, tty } from "../../deps.ts";

import { System } from "../../ecs/systems.ts";
import { consoleSize } from "../../utils/console.ts";
import { LazyInitialize } from "../../utils/decorators.ts";
import { TimeData, timeData } from "./kenetics.ts";

@Service()
export class FPSDisplay extends System {
  priority = Infinity;

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  private fpsArray: number[] = [];

  public get fps() {
    if (!this.fpsArray) return 0;
    return Math.floor(
      this.fpsArray.reduce((s, x) => s + x, 0) / this.fpsArray.length,
    );
  }

  private add() {
    if (this.time.dt === 0) return;
    this.fpsArray.unshift(1 / this.time.dt * 1000);
    this.fpsArray = this.fpsArray.slice(0, 30);
  }

  update() {
    this.add();
    const { columns } = consoleSize();
    tty.writeSync(tty.SAVE, Deno.stdout);
    tty.goToSync(columns - 20, 3);
    const s = `FPS: ${this.fps}` + " ".repeat(10);
    tty.writeSync(s.slice(0, 10), Deno.stdout);
    tty.writeSync(tty.RESTORE, Deno.stdout);
  }
}
