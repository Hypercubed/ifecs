import { inverse, Service, tty, wrap } from "../../deps.ts";
import { Entity, IterativeSystem, Tag } from "../../ecs/mod.ts";
import { consoleSize } from "../../utils/console.ts";
import { Actor } from "../entities/actors.ts";

export const outputQueue = new Tag<string[][]>("ifecs-output", []);

@Service()
export class OutputSystem extends IterativeSystem {
  public readonly query = Actor.filter<Entity>((m) => m.has(outputQueue));

  priority = Infinity;

  slowTyping = true;
  flash = false;

  updateEntity(actor: Actor) {
    const queue = actor.get(outputQueue)!;
    if (queue.length > 0) {
      const width = consoleSize().columns - 5;
      while (queue.length > 0) {
        const str = wrap((queue.shift() || []).join(" "), { width });
        tty.clearLineSync();
        tty.goLeftSync(10000);

        let base = 20;

        if (this.slowTyping) {
          for (const c of splitAroundAnsi(str)) {
            if (this.flash) {
              tty.writeSync(tty.SAVE, Deno.stdout);
              tty.writeSync(inverse(c), Deno.stdout);
              sleep((0.2 + Math.random() * 1.8) * base);
              tty.hideCursorSync();
              tty.writeSync(tty.RESTORE, Deno.stdout);
            }
            tty.writeSync(c, Deno.stdout);
            sleep((0.2 + Math.random() * 1.8) * base);
            tty.showCursorSync();
            base = 0.98 * base;
          }
          tty.writeSync("\n", Deno.stdout);
        } else {
          console.log(str);
        }
      }
    }

    actor.remove(outputQueue);
  }
}

function splitAroundAnsi(str: string) {
  const s = str.match(
    // deno-lint-ignore no-control-regex
    /(?:(?:\x1B\[[\d;]*m)*[^\x1B]){1,3}(?:(?:\x1B\[[\d;]*m)+$)?/g,
  );
  return Array.from(s || []);
}

function sleep(ms: number) {
  var start = new Date().getTime(), expire = start + ms;
  while (new Date().getTime() < expire) {
    // nop
  }
  return;
}
