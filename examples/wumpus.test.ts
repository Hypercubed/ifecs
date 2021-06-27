import { Engine } from "../ecs/mod.ts";

import { WumpusGame } from "./wumpus.ts";
import { prng } from "../utils/random.ts";
import { assertPlay } from "../utils/test-tools.ts";

const { test } = Deno;

test("plays wumpus", () => {
  prng.init_seed(0);

  const world = new Engine()
    .include(WumpusGame)
    .initialize();

  assertPlay(
    world,
    `
    HUNT THE WUMPUS
    ===============
    You are in room 1.
    Exits go to: 2, 5, 8

    > inventory
    You are carrying:
    quiver The quiver contains: 5 arrows.

    > move 2
    Entering room 2...
    You are in room 2.
    Exits go to: 1, 3, 10

    > m 3
    Entering room 3...
    You are in room 3.
    You smell something terrible nearby.
    Exits go to: 2, 4, 12

    > shoot 12
    Shooting an arrow into room 12...
    YOU KILLED THE WUMPUS! GOOD JOB, BUDDY!!!
  `,
  );

  world.destroy();
});
