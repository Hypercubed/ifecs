import { blue, bold, green, tty } from "../deps.ts";
import { readKeypress } from "./deps.ts";

import { Engine, ModuleType } from "../ecs/mod.ts";

import { ActionSystem } from "../lib/systems/action.system.ts";

import { Token } from "../lib/entities/tokens.ts";
import { Composite, Thing } from "../lib/entities/things.ts";
import { Player } from "../lib/entities/actors.ts";
import { Location } from "../lib/entities/locations.ts";
import { consoleSize } from "../utils/console.ts";
import { History } from "./history.ts";
import {
  getItemDescription,
  printClasses,
  printMap,
  printTree,
} from "./debug-tools.ts";
import { OutputSystem } from "../lib/systems/output.system.ts";

const PROMPT = ">> ";
// TEXTCOLOR

const textEncoder = new TextEncoder();

const PROMPT_ENCODED = textEncoder.encode(PROMPT);

const { stdout, stdin } = Deno;
const { rows } = consoleSize();

const history = new History();

// Make a service so output system can hide/show prompt
async function readline(): Promise<string | null> {
  let input = "";
  let lastInput = "";
  let cursor = 0;

  _refreshLine();

  for await (const keypress of readKeypress()) {
    // console.log(keypress);

    if (keypress.key === "escape") continue;

    if (keypress.ctrlKey) {
      switch (keypress.key) {
        case "c":
        case "z":
          Deno.exit(0);
          break;
        case "u":
          input = "";
          _refreshLine();
          continue;
        case "l":
          tty.clearScreenSync();
          tty.goHomeSync();
          _refreshLine();
          continue;
        case "n":
          _historyNext();
          continue;
        case "p":
          _historyPrev();
          continue;
          // CTRL+W - Delete backward to a word boundary
          // CTRL+Backspace - Delete backward to a word boundary
      }
    } else if (keypress.metaKey) {
      // nop
    } else {
      switch (keypress.key) {
        case "backspace":
        case "delete": // Move this
          _backspace();
          continue;
        case "return":
        case "enter":
          try {
            // @ts-ignore setRaw
            Deno.setRaw(Deno.stdin.rid, false);
          } catch (_) {
            // nop
          }
          _refreshLine();
          console.log("");
          history.resetPosition();
          return input;
        case "up":
          _historyPrev();
          continue;
        case "down":
          _historyNext();
          continue;
        case "left":
          if (cursor > 0) {
            cursor--;
            _refreshLine();
          }
          continue;
        case "right":
          if (cursor <= input.length) {
            cursor++;
            _refreshLine();
          }
          continue;
        case "home":
          cursor = 0;
          continue;
        case "end":
          cursor = input.length;
          continue;
        default:
          _type(keypress.sequence);
          continue;
      }
    }
  }
  return "";

  function _historyPrev() {
    if (history.position === -1) {
      lastInput = input;
    }
    input = history.prev()!;
    cursor = input.length;
    _refreshLine();
  }

  function _historyNext() {
    input = history.next()!;
    if (history.position === -1) {
      input = lastInput;
    }
    cursor = input.length;
    _refreshLine();
  }

  function _refreshLine() {
    tty.hideCursorSync();
    tty.goLeftSync(10000);
    tty.clearLineSync();
    // stdout.writeSync(textEncoder.encode(`${cursor} ${input.length}`));
    stdout.writeSync(PROMPT_ENCODED);
    stdout.writeSync(
      textEncoder.encode(input.startsWith(".") ? blue(input) : green(input)),
    );
    if (cursor < input.length) {
      tty.goLeftSync(input.length - cursor);
    }
    tty.showCursorSync();
  }

  function _backspace() {
    if (input.length > 0) {
      if (cursor >= input.length) {
        input = input.slice(0, -1);
        cursor = input.length;
      } else {
        const before = input.slice(0, cursor - 1);
        const after = input.slice(cursor);
        input = before + after;
        cursor = before.length;
      }
      _refreshLine();
    }
  }

  function _type(sequence: string) {
    if (sequence.length > 0) {
      if (cursor >= input.length) {
        input += sequence;
        cursor = input.length;
      } else {
        const before = input.slice(0, cursor);
        const after = input.slice(cursor);
        input = before + sequence + after;
        cursor += sequence.length;
      }
      _refreshLine();
    }
  }
}

export async function run(game: ModuleType) {
  if (!Deno.isatty(stdin.rid)) {
    throw new Error("Can be read only under TTY.");
  }

  let world!: Engine;
  let player!: Player;
  let output!: OutputSystem;

  reset();
  history.save();

  do {
    let line = await readline();

    if (!line) continue;
    line = line.trim().toLowerCase();
    history.add(line);

    if (line.startsWith(".")) { // CLI command
      const [command, ...rest] = line.split(/\s/);
      switch (command) {
        case ".restart":
          reset();
          break;
        case ".typing":
          if (output.slowTyping) {
            output.slowTyping = false;
            print("typing effect is now off");
          } else {
            output.slowTyping = true;
            print("typing effect is now on");
          }
          break;
        case ".replay": {
          replay(history.history);
          break;
        }
        case ".undo": {
          history.undo();
          replay(history.history);
          break;
        }
        case ".save":
          history.save();
          print("game saved");
          break;
        case ".restore": {
          history.restore();
          replay(history.history);
          break;
        }
        case ".history":
          console.log();
          history.history.forEach((line) => {
            print(line);
          });
          break;
        case ".quit":
          Deno.exit(0);
          break;
        case ".actions": {
          const actionSystem = world.get(ActionSystem)!;
          actionSystem.actions.forEach((action) => {
            // console.log(action.description);
            const act = actionSystem.generateNLPMatcher(player, action);
            if (act) {
              console.log(
                "  ",
                act.matcher,
              );
            }
          });
          break;
        }
        case ".tokens":
          world.findEntities(Token).map((token: Token) => {
            console.log(getItemDescription(token));
          });
          break;
        case ".tree": {
          printTree(world.findEntities(Thing));
          break;
        }
        case ".classes":
          printClasses(world.entities);
          break;
        case ".map": {
          const player = world.get(Player)!;
          const room = player.container!;
          printMap(room);
          break;
        }
        case ".systems":
          console.log(world.systems.map((s) => s.constructor.name));
          break;
        case ".showme": {
          const item = findToken<Token>(rest.join(" "));
          if (item) {
            console.log(getItemDescription(item), item.match);
            if (item instanceof Thing) {
              console.log(
                `  Container: `,
                item.container
                  ? getItemDescription(item.container)
                  : item.container,
              );
              if (item.tags.length) {
                console.log(`  Tags:`);
                item.tags.forEach((tag) => {
                  console.log("    ", String(tag));
                });
              }
              if (item instanceof Composite && item.contents) {
                console.log(`  Containing:`);
                item.contents.forEach((item) => {
                  console.log("    ", getItemDescription(item));
                });
              }
            }
          }
          break;
        }
        case ".take": {
          const player = world.get(Player)!;
          const item = findToken<Thing>(rest.join(" "));
          if (item) item.moveTo(player);
          break;
        }
        case ".goto": {
          const player = world.get(Player)!;
          const room = findToken<Location>(rest.join(" "));
          if (room) player.moveTo(room);
          break;
        }
        case ".sees": {
          const things = world.findEntities(Thing);
          things.forEach((thing) => {
            if (player.sees(thing)) {
              console.log(getItemDescription(thing));
            }
          });
          break;
        }
        case ".near": {
          const things = world.findEntities(Thing);
          things.forEach((thing) => {
            if (player.near(thing)) {
              console.log(getItemDescription(thing));
            }
          });
          break;
        }
        // .scope
        // .gonear
        // case '.help':
        // case '.about':
        // case '.info':
        //   Deno.exit(0);
        // continue;
        default:
          print("I don't understand that command!");
      }
    } else if (world.running) { // player command
      console.log("");
      player.do(line);
    } else { // dead?
      console.log("Would you like to .restart or .quit?");
    }

    console.log("");
  } while (true);

  function reset() {
    let slowTyping = true;

    tty.goHomeSync();
    tty.clearDownSync();
    tty.goToSync(1, rows);

    history.clear();

    console.log();
    console.log();
    console.log(bold("IFECS v0.0.0"));
    console.log();

    if (world) {
      world.destroy();
    }
    if (output) {
      slowTyping = output.slowTyping;
    }

    world = new Engine()
      .include(game)
      .initialize();

    player = world.get(Player)!;
    output = world.get(OutputSystem)!;

    output.slowTyping = slowTyping;

    world.start();
    world.loop(0.5); // 1/2 fps
    console.log();

    // printClasses(world.entities);
    // Deno.exit();

    world.onEnd.subscribe(() => {
      console.log("Would you like to .restart or .quit?");
      console.log();
    });
  }

  function replay(h: string[]) {
    // TODO: need to set random seed
    reset();
    h.forEach((line) => {
      if (line.startsWith(".")) return;
      stdout.writeSync(PROMPT_ENCODED);
      console.log(line);
      console.log();
      player.do(line);
    });
  }

  function findToken<T extends Token = Token>(text: string): T | undefined {
    return world.findEntities(Token, (t) => {
      return t.name === text || t.fullMatch(text);
    })[0] as T;
  }

  function print(str: string) {
    console.log(blue(str));
  }
}
