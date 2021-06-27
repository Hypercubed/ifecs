import { Engine } from "../ecs/mod.ts";
import { Player } from "../lib/entities/actors.ts";
import { assertEquals, stripColor, Stub, stub } from "../test_deps.ts";

export const popText = (calls: Array<{ args: string[] }>) => {
  const t = calls.flatMap((c) =>
    c.args.flatMap((a: string) => stripColor(a).split("\n"))
  );
  calls.splice(0, Infinity);
  return t;
};

export function assertPlay(world: Engine, play: string) {
  const player = world.get(Player)!;
  const say: Stub<Player> = stub(player, "say");
  world.start();

  const lines = stripIndent(play).split("\n");

  const expected = lines.filter((line) => {
    line = line.trim();
    if (line.startsWith(">")) {
      player.say(line);
      player.do(line.replace(/^>/, ""));
    } else if (line.startsWith("#")) {
      return false;
    }
    return line;
  });

  const actual = popText(say.calls).map((l) => l.trim()).filter((l) =>
    l.length
  );

  assertEquals(actual, expected);
}

function minIndent(string: string) {
  const match = string.match(/^[ \t]*(?=\S)/gm);
  if (!match) {
    return 0;
  }
  return match.reduce((r, a) => Math.min(r, a.length), Infinity);
}

export function stripIndent(string: string) {
  const indent = minIndent(string);
  if (indent === 0) {
    return string;
  }
  const regex = new RegExp(`^[ \\t]{${indent}}`, "gm");
  return string.replace(regex, "");
}
