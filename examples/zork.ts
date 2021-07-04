#!/usr/bin/env -S deno run --unstable --allow-all

/*
 * Super mini-zork
 */

import { Engine, Module, ModuleDecorator } from "../ecs/mod.ts";
import { ActionSystem, syntax } from "../lib/systems/action.system.ts";

import { bold, Inject } from "../deps.ts";

import { DirectionsModule } from "../lib/modules/directions.module.ts";

import { Container, Supporter, Thing } from "../lib/entities/things.ts";
import { Location } from "../lib/entities/locations.ts";
import { Actor, Player } from "../lib/entities/actors.ts";
import { StdLib } from "../lib/modules/std.module.ts";
import { Direction } from "../lib/entities/directions.ts";
import { score } from "../lib/systems/score.system.ts";
import { Portal } from "../lib/entities/portals.ts";
import {
  closable,
  closed,
  enterable,
  examinable,
  fixed,
  hidden,
  lockable,
  locked,
  lookable,
  offable,
  onable,
  openable,
  pushable,
  readable,
  scenery,
} from "../lib/modules/verbs/tags.ts";

const LEAFLET_TEXT = `
Welcome to Zork!

Zork is a game of adventure, danger, and low cunning.  In it you will explore some of the most amazing territory ever seen by mortal man.  Hardened adventurers have run screaming from the terrors contained within.

In Zork, the intrepid explorer delves into the forgotten secrets of a lost labyrinth deep in the bowels of the earth, searching for vast treasures long hidden from prying eyes, treasures guarded by fearsome monsters and diabolical traps!

No system should be without one!

Zork was created at the MIT Laboratory for Computer Science by Tim Anderson, Marc Blank, Bruce Daniels, and Dave Lebling.  It was inspired by the Adventure game of Crowther and Woods, and the long tradition of fantasy and science fiction games.
`;

@ModuleDecorator({
  requires: [
    StdLib,
  ],
})
export class ZorkGame extends Module {
  @Inject(Engine)
  protected engine!: Engine;

  onInit() {
    return zorkGame(this.engine);
  }

  onStart() {
    const player = this.engine.get(Player)!;

    player.say(bold("ZORK"));
    player.say();
    player.say(player.look());
  }
}

function zorkGame(world: Engine) {
  const {
    north,
    south,
    east,
    west,
    up,
    down,
  } = world.get(DirectionsModule)!;

  const actionSystem = world.get(ActionSystem)!;
  const player = world.get(Player)!;

  // ********* LOCATIONS **************
  const westOfHouse = new Location(
    "West of House",
    `You are in an open field on the west side of a white house with a boarded front door.`,
  );

  const northOfHouse = new Location(
    "North of House",
    "You are facing the north side of a white house. There is no door here, and all the windows are barred.",
  );

  const southOfHouse = new Location(
    "South of House",
    "You are facing the south side of a white house. There is no door here, and all the windows are barred.",
  );

  const behindHouse = new Location(
    "Behind House",
    "You are behind the white house. In one corner of the house there is a small window which is slightly ajar.",
  )
    .add(
      lookable,
      () =>
        `You are behind the white house. In one corner of the house is a window that is ${
          houseWindow.has(closed) ? "slightly ajar" : "open"
        }.`,
    );

  const kitchen = new Location(
    "Kitchen",
    "You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open. On the table is an elongated brown sack, smelling of hot peppers.",
  )
    .add(
      lookable,
      () =>
        `This is the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is ${
          houseWindow.has(closed) ? "closed" : "open"
        }.`,
    );

  const living = new Location(
    "Living Room",
    `You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.`,
  );

  const celler = new Location(
    "Celler",
    `You are in a dark and damp cellar with a narrow passageway leading north, and a crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.`,
  )
    .add(enterable, () => {
      celler.remove(enterable);
      return `The trap door crashes shut, and you hear someone barring it.`;
    });

  const attic = new Location(
    "Attic",
    `This is the attic. The only exit is a stairway leading down.`,
  );

  // ********* PLAYER **************
  player
    .moveTo(westOfHouse)
    .add(examinable, `That's difficult unless your eyes are prehensile.`)
    .remove(score);

  // ********* THINGS **************
  const mailbox = new Container(
    "small mailbox",
    /mailbox|mail box|box|mail-box/,
    `It's a small mailbox.`,
  )
    .add(fixed)
    .add(closed)
    .add(openable)
    .add(closable)
    .add(lookable, `There is a small mailbox here.`)
    .moveTo(westOfHouse);

  new Thing(
    `rubber welcome mat`,
    /mat|rubber mat/,
    `A rubber mat saying "Welcome to Zork".`,
  )
    .moveTo(westOfHouse)
    .add(lookable, `A rubber mat saying 'Welcome to Zork' lies by the door.`)
    .add(examinable, `A rubber mat saying "Welcome to Zork".`);

  new Thing(
    "leaflet",
    /leaflet|mail|pamphlet|booklet/,
    `A leaflet`,
  )
    .add(readable, LEAFLET_TEXT)
    .moveTo(mailbox);

  const houseWindow = new Portal("small window", /window/, `a small window`)
    .add(
      openable,
      `With great effort, you open the window far enough to allow entry.`,
    )
    .add(closable, `The window closes (more easily than it opened).`)
    .add(closed)
    .add(scenery)
    .connects(behindHouse, kitchen);

  const table = new Supporter(
    "table",
    /table/,
    `A table seems to have been used recently for the preparation of food.`,
  )
    .add(fixed)
    .moveTo(kitchen)
    .add(lookable, `There is a table here.`);

  const bag = new Container("bag", /bag|sack/, "A brown bag.")
    .add(openable)
    .add(closed)
    .moveTo(table)
    .add(
      lookable,
      `On the table is an enlongated brown sack, smelling of hot peppers.`,
    );

  new Thing("garlic")
    .moveTo(bag);

  new Thing("bottle")
    .moveTo(table);

  new Portal("front door", /door|front door/, `The front door`)
    .add(scenery)
    .add(locked)
    .add(lockable)
    .add(openable, `locked`)
    .moveTo(westOfHouse)
    .connects(westOfHouse, living);

  new Thing("elvish sword", /elvish sword|sword|glamdring|orcrist/)
    .moveTo(living)
    .add(
      lookable,
      `Above the trophy case hangs an elvish sword of great antiquity.`,
    );

  new Thing(
    "lamp",
    /lamp/,
    `A battery-powered brass lantern.`,
  )
    .moveTo(living)
    .add(
      lookable,
      `A battery powered brass lantern is on the trophy case.`,
    )
    .add(onable)
    .add(offable);

  const trapDoor = new Portal("trap door", "(door|trap door)")
    .add(scenery)
    .add(
      openable,
      `The door reluctantly opens to reveal a rickety staircase descending into darkness.`,
    )
    .add(closed);

  new Thing(`newspaper`)
    .moveTo(living)
    .add(scenery)
    .add(readable, `US NEWS AND DUNGEON REPORT`);

  new Thing(`trophy case`, "(trophy case|case)")
    .moveTo(living)
    .add(scenery)
    .add(openable)
    .add(closed);

  // TODO: backdrops
  // const house = new Thing("house", /house/, `The house is a beautiful colonial house which is painted white.  It is clear that the owners must have been extremely wealthy.`);

  const rug = new Thing("rug")
    .add(scenery)
    .add(
      pushable,
      `With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.`,
    )
    .moveTo(living);

  new Thing("rope")
    .add(lookable, `A large coil of rope is lying in the corner.`)
    .moveTo(attic);

  const atticTable = new Supporter(
    "table",
    /table/,
    `On a table is a nasty-looking knife.`,
  )
    .add(fixed)
    .moveTo(attic)
    .add(lookable, `On a table is a nasty-looking knife.`);

  new Thing("knife")
    .moveTo(atticTable);

  // ********* DIRECTIONS **************
  westOfHouse.add(north, northOfHouse);
  westOfHouse.add(south, southOfHouse);

  northOfHouse.add(west, westOfHouse);
  northOfHouse.add(east, behindHouse);

  southOfHouse.add(west, westOfHouse);
  southOfHouse.add(east, behindHouse);

  behindHouse.add(north, northOfHouse);
  behindHouse.add(south, southOfHouse);

  const intoWindow = new Direction("In", /w|west|in/).add(hidden);
  behindHouse.add(intoWindow, kitchen);
  behindHouse.add(west, houseWindow);

  kitchen.add(west, living);
  kitchen.add(east, houseWindow);
  kitchen.add(up, attic);

  attic.add(down, kitchen);

  living.add(east, kitchen);

  // ********* ACTIONS **************
  const YOU_CANT_SEE_IT = `You can't see any such thing.`;

  actionSystem.add(
    syntax`(enter|climb through) ${houseWindow}`,
    (actor: Actor, thing: typeof houseWindow) => {
      if (!actor.sees(thing)) return YOU_CANT_SEE_IT;
      if (houseWindow.has(closed)) return `It's closed.`;
      actor.moveTo(kitchen);
      intoWindow.remove(hidden);
      return actor.look();
    },
  );

  actionSystem.add(
    syntax`/move|push/ ${rug}`,
    (actor: Actor, thing: typeof rug) => {
      if (!actor.sees(thing)) return YOU_CANT_SEE_IT;
      rug.moveTo(null);
      living.add(down, trapDoor);
      celler.add(up, trapDoor);
      trapDoor.connects(living, celler);
      return rug.get(pushable)!;
    },
  );

  return {
    player,
  };
}

if (import.meta.main) {
  import("../runner/mod.ts").then(({ run }) => {
    run(ZorkGame);
  });
}
