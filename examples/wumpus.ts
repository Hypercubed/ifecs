#!/usr/bin/env -S deno run --unstable --allow-all

import { Engine, Module, ModuleDecorator, Tag } from "../ecs/mod.ts";

import { ActionSystem, syntax } from "../lib/systems/action.system.ts";
import { IFModule } from "../lib/modules/if.module.ts";
import { PlayerModule } from "../lib/modules/player.module.ts";
import { VerbsModule } from "../lib/modules/verbs.module.ts";

import { Container, Thing } from "../lib/entities/things.ts";
import { Actor, Player } from "../lib/entities/actors.ts";
import { Location } from "../lib/entities/locations.ts";
import { Direction } from "../lib/entities/directions.ts";

import { Inject } from "../deps.ts";
import { prng } from "../utils/random.ts";
import { WhatModule } from "../lib/modules/what.module.ts";

const HELP = `
Welcome to "Hunt the Wumpus"
The wumpus lives in a cave of 20 rooms. Each room has 3 tunnels to
other rooms. (Look at a dodecahedron to see how this works. If you
dont know what a dodecahedron is, ask someone.)
Hazards:
 Bottomless pits - Two rooms have bottomless pits in them. If you go
   there, you fall into the pit (& lose)!
 Super bats - Two other rooms have super bats. If you go there, a
   bat grabs you and takes you to some other room at random (which
   may be troublesome).
Wumpus:
   The wumpus is not bothered by hazards. (He has sucker feet and is
   too big for a bat to lift.)  Usually he is asleep. Two things
   wake him up: your shooting an arrow, or your entering his room.
   If the wumpus wakes, he moves one room or stays still.
   After that, if he is where you are, he eats you up and you lose!
You:
   Each turn you may move or shoot an arrow.
   Moving:  You can move one room (through one tunnel).
   Arrows:  You have 5 arrows. You lose when you run out (eventually).
      You can only shoot to nearby rooms.
      If the arrow hits the wumpus, you win.
Warnings:
   When you are one room away from a wumpus or hazard, the computer
   says:
   Wumpus:  "You smell something terrible nearby."
   Bat   :  "You hear a rustling."
   Pit   :  "You feel a cold wind blowing from a nearby cavern."
`;

const TUNNELS = [
  [2, 5, 8], // 1
  [1, 3, 10], // 2
  [2, 4, 12], // 3
  [3, 5, 14], // 4
  [1, 4, 6], // 5
  [5, 7, 15], // 6
  [6, 8, 17], // 7
  [1, 7, 9], // 8
  [8, 10, 18], // 9
  [2, 9, 11], // 10
  [10, 12, 19], // 11
  [3, 11, 13], // 12
  [12, 14, 20], // 13
  [4, 13, 15], // 14
  [6, 14, 16], // 15
  [15, 17, 20], // 16
  [7, 16, 18], // 17
  [9, 17, 19], // 18
  [11, 18, 20], // 19
  [13, 16, 19], // 20
];

class Threat extends Tag {
  constructor(public readonly description: string) {
    super();
  }
}

export const bats = new Threat(`You hear a rustling.`);
export const pit = new Threat(
  `You feel a cold wind blowing from a nearby cavern.`,
);

const ammunition = new Tag("wumpus/arrow");

@ModuleDecorator({
  requires: [
    IFModule,
    WhatModule,
    PlayerModule,
    VerbsModule,
  ],
})
export class WumpusGame extends Module {
  @Inject(Engine)
  protected engine!: Engine;

  wumpus!: Thing;
  rooms!: Location[];

  onInit() {
    const { wumpus, rooms } = wumpusGame(this.engine);
    this.wumpus = wumpus;
    this.rooms = rooms;
  }
}

function wumpusGame(world: Engine) {
  const actionSystem = world.get(ActionSystem)!;
  const player = world.get(Player)!;

  // THINGS
  const quiver = new Container("quiver")
    .moveTo(player);

  const wumpus = new Thing(
    "wumpus",
    undefined,
    `You smell something terrible nearby.`,
  );

  const arrows = Array.from({ length: 5 }, () => {
    return new Thing("arrow")
      .moveTo(quiver)
      .add(ammunition);
  });

  // ROOMS
  const rooms: Location[] = Array.from({ length: 20 }, (_, i) => {
    return new Location("" + (i + 1), `room ${i + 1}`);
  });

  const exits = Array.from({ length: 20 }, (_, i) => {
    return new Direction("" + (i + 1));
  });

  TUNNELS.forEach(([a, b, c], i) => {
    rooms[i]
      .add(exits[a - 1], rooms[a - 1])
      .add(exits[b - 1], rooms[b - 1])
      .add(exits[c - 1], rooms[c - 1]);
  });

  // TOOLS
  const getThreat = (room: Location): Threat | Player | Thing | null => {
    if (room.has(wumpus)) return wumpus;
    if (room.has(pit)) return pit;
    if (room.has(bats)) return bats;
    if (room.has(player)) return player;
    return null;
  };
  const getEmptyLocations = () => rooms.filter((room) => !getThreat(room));
  const pickEmptyLocation = () => chooseOne(getEmptyLocations());
  const getDetection = (room: Location) => getThreat(room)?.description ?? ""; // TODO: wupus and bats can be in the same room!
  const arrowCount = () => {
    let N = player.contents.filter((t) => t.has(ammunition)).length;
    if (player.has(quiver)) {
      N += quiver.contents.filter((t) => t.has(ammunition)).length;
    }
    return N;
  };
  const arrowMsg = () => {
    const N = arrowCount();
    switch (N) {
      case 0:
        return `Your quiver is empty.`;
      case 1:
        return `You have only one arrow left.`;
      default:
        return `You have ${N} arrows remaining.`;
    }
  };

  const getThreats = (exits: Location[]) => {
    return exits.reduce((acc, exit) => {
      const detect = getDetection(exit);
      if (detect && !acc.includes(detect)) {
        if (prng.random() < 0.5) {
          acc.push(detect);
        } else {
          acc.unshift(detect);
        }
      }
      return acc;
    }, [] as string[]);
  };

  // ACTIONS
  const describeLocation = () => {
    const currentLocation = player.container;
    if (!currentLocation) {
      return `You see nothing. You might be dead. (try .restart)`;
    }
    player.say(`You are in ${currentLocation.description}.`);
    const exits = currentLocation.exits.map(([_, l]) => l) as Location[];
    player.say(getThreats(exits).join("\n"));
    return `Exits go to: ${exits.join(", ")}`;
  };

  const enterLocation = (newLocation: Location) => {
    player.say(`Entering ${newLocation.description}...\n`);

    switch (getThreat(newLocation)) {
      case pit:
        player.moveTo(null);
        return `You fall into a pit. **Game Over**`;
      case wumpus:
        player.moveTo(null);
        return `Wumpus eats you. **Game Over**`;
      case bats:
        player.say(
          `You encounter a bat, it transports you to a random empty room.\n`,
        );
        newLocation = pickEmptyLocation();
    }

    player.moveTo(newLocation);
    return describeLocation();
  };

  const shootIntoLocation = (intoLocation: Location) => {
    if (arrows.length < 1) return arrowMsg();

    player.say(`Shooting an arrow into ${intoLocation.description}...\n`);

    const spentArrow = arrows.pop();
    spentArrow!.moveTo(null);

    if (intoLocation.has(wumpus)) {
      player.moveTo(null);
      return `YOU KILLED THE WUMPUS! GOOD JOB, BUDDY!!!`;
    } else if (prng.random() < 0.75) { // Chance that wumpus moves
      const [, movedTo] = chooseOne(
        intoLocation.exits as [unknown, Location][],
      );
      wumpus.moveTo(movedTo);
      if (movedTo.has(player)) {
        player.moveTo(null);
        return `Wumpus enters your room and eats you!`;
      }
      player.say(arrowMsg());
    }
    return describeLocation();
  };

  // ACTIONS

  actionSystem.add("help", () => HELP);

  // LOOK
  actionSystem.add(/l|look/, () => describeLocation());

  actionSystem.add(
    "wait",
    () => {
      const currentLocation = player.container;
      if (currentLocation) {
        const exits = currentLocation.exits.map(([_, l]) => l) as Location[];
        const threats = getThreats(exits);
        if (threats.length) {
          return threats.join("\n");
        }
      }
      return `Time passes.`;
    },
  );

  actionSystem.add(
    "smell",
    () => {
      const currentLocation = player.container;
      if (currentLocation) {
        const exits = currentLocation.exits.map(([_, l]) => l) as Location[];
        if (exits.some((l) => l.has(wumpus))) {
          return wumpus.description;
        }
      }
      return `You smell nothing unusual.`;
    },
  );

  actionSystem.add(
    "listen",
    () => {
      const currentLocation = player.container;
      if (currentLocation) {
        const exits = currentLocation.exits;
        if (exits.some(([_, l]) => l.has(bats))) {
          return bats.description;
        }
      }
      return `You hear nothing unusual.`;
    },
  );

  actionSystem.add(
    "feel",
    () => {
      const currentLocation = player.container;
      if (currentLocation) {
        const exits = currentLocation.exits.map(([_, l]) => l);
        if (exits.some((l) => l.has(pit))) {
          return pit.description;
        }
      }
      return `You feel nothing unusual.`;
    },
  );

  // MOVE
  actionSystem.add(
    syntax`(m |move )? ${Direction}`,
    (actor: Actor, exit: Direction) => {
      const currentLocation = actor.container;
      if (!(currentLocation && currentLocation.has(exit))) {
        return `You can't go that way.`;
      }
      const location = currentLocation.get(exit)! as Location;
      return enterLocation(location);
    },
  );

  // SHOOT
  actionSystem.add(
    syntax`/s|shoot/ ${Direction}`,
    (_actor: Actor, exit: Direction) => {
      if (arrowCount() < 1) return `You have no arrows left`;
      const currentLocation = player.container;
      if (!(currentLocation && currentLocation.has(exit))) {
        return `There are no tunnels from here to that room.`;
      }
      const location = currentLocation.get(exit)! as Location;
      return shootIntoLocation(location);
    },
  );

  // SETUP
  player.moveTo(rooms[0]);
  wumpus.moveTo(pickEmptyLocation());

  pickEmptyLocation().add(bats);
  pickEmptyLocation().add(bats);
  pickEmptyLocation().add(pit);
  pickEmptyLocation().add(pit);

  world.onStart.subscribe(() => {
    player.say("HUNT THE WUMPUS");
    player.say("===============");
    player.say();

    player.say(describeLocation());
  });

  return { wumpus, rooms };
}

function chooseOne<T = unknown>(arr: T[]): T {
  const i = Math.floor(arr.length * prng.random());
  return arr[i];
}

if (import.meta.main) {
  import("../runner/mod.ts").then(({ run }) => {
    run(WumpusGame);
  });
}
