import { CloakGame } from "../examples/cloak.ts";
import { Engine } from "../ecs/mod.ts";

import { Player } from "../lib/entities/actors.ts";
import { outputQueue } from "../lib/components/output-queue.component.ts";

// @ts-ignore GlkOte
const glkOte = window["GlkOte"];

let generation = 1;

// deno-lint-ignore no-explicit-any
let metrics: any = null;

const streamout = new Array();

const PROMPT = "\n>> ";

let world: Engine;
let player: Player;

function startup() {
  say("IFECS v0.0.0\n");

  world = new Engine()
    .include(CloakGame)
    .initialize();

  player = world.get(Player)!;

  world.loop(0.5);
  render();
}

function say(val: string, style?: string, runon?: boolean) {
  if (style == undefined) {
    style = "normal";
  }
  var ls = val.split("\n");
  for (let ix = 0; ix < ls.length; ix++) {
    if (runon) {
      if (ls[ix]) {
        streamout.push({ content: [style, ls[ix]], append: "true" });
      }
      runon = false;
    } else {
      if (ls[ix]) {
        streamout.push({ content: [style, ls[ix]] });
      } else {
        streamout.push({});
      }
    }
  }
}

// deno-lint-ignore no-explicit-any
function gameAccept(res: any) {
  if (res.type == "init") {
    metrics = res.metrics;
    startup();
  } else if (res.type == "arrange") {
    metrics = res.metrics;
  } else if (res.type == "line") {
    say(res.value, "input", true);
    player.do(res.value);
    render();
  }

  gameUpdate();
}

function render() {
  const out = player.get(outputQueue) || [];
  while (out.length) {
    say(out.shift()!.join(""));
  }
  say(PROMPT);
}

/* This constructs the game display update and sends it to the display.
   It's all set up for a basic game that accepts line input. */
function gameUpdate() {
  generation = generation + 1;

  var pWidth = metrics.width;
  var pHeight = metrics.height;

  var argw = [
    {
      id: 1,
      type: "buffer",
      rock: 11,
      left: metrics.outspacingx,
      top: metrics.outspacingy,
      width: pWidth - (2 * metrics.outspacingx),
      height: pHeight - (metrics.outspacingy + metrics.outspacingy),
    },
  ];

  var argc = [];
  // deno-lint-ignore no-explicit-any
  var obj: any = { id: 1 };
  if (streamout.length) {
    if (streamout.length) {
      obj.text = streamout;
    }
    argc.push(obj);
  }

  var argi = [
    { id: 1, gen: generation, type: "line", maxlen: 200 },
  ];

  var arg = {
    type: "update",
    gen: generation,
    windows: argw,
    content: argc,
    input: argi,
  };

  glkOte.update(arg);

  streamout.length = 0;
}

// @ts-ignore Game global
window["Game"] = {
  accept: gameAccept,
  spacing: 0,
};

glkOte.init();
