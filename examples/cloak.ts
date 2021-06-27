#!/usr/bin/env -S deno run --unstable --allow-all

/*
 * Cloak of Darkness - a simple demonstration of Interactive Fiction
 * http://www.firthworks.com/roger/cloak/
 */

import { Engine, Tag } from "../ecs/mod.ts";
import { ActionSystem, syntax } from "../lib/systems/action.system.ts";

import { StdLib } from "../lib/modules/std.module.ts";

import { Actor, Player } from "../lib/entities/actors.ts";
import { Module, ModuleDecorator } from "../ecs/module.ts";
import { DirectionsModule } from "../lib/modules/directions.module.ts";

import { Location } from "../lib/entities/locations.ts";
import { Supporter, Thing } from "../lib/entities/things.ts";
import { TurnsSystem } from "../lib/systems/turns.system.ts";
import { ScoreSystem } from "../lib/systems/score.system.ts";
import { bold, Inject } from "../deps.ts";
import { RuleSystem } from "../lib/systems/rules.system.ts";
import {
  cannotGo,
  darkness,
  examinable,
  fixed,
  read,
  readable,
  scenery,
  worn,
} from "../lib/modules/verbs/tags.ts";

// Tags
const disturbed = new Tag();

@ModuleDecorator({
  requires: [
    StdLib,
  ],
})
export class CloakGame extends Module {
  @Inject(Engine)
  protected engine!: Engine;

  @Inject(Player)
  protected player!: Player;

  onInit() {
    return cloakGame(this.engine);
  }

  onStart() {
    this.player.say(
      `Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House. It's surprising that there aren't more people about but, hey, what do you expect in a cheap demo game...?`,
    );
    this.player.say();
    this.player.say(bold("Cloak of Darkness"));
    this.player.say("A basic IF demonstration.");
    this.player.say();
    this.player.say(this.player.look());
  }

  onEnd() {
    const turnsSystem = this.engine.get(TurnsSystem)!;
    const scoreSystem = this.engine.get(ScoreSystem)!;

    this.player.say(
      `In that game you scored ${scoreSystem.score} out of a possible 2, in ${turnsSystem.turns} turns.`,
    );
    this.engine.update(); // Hack to trigger last render
  }
}

function cloakGame(world: Engine) {
  const {
    north,
    south,
    east,
    west,
  } = world.get<DirectionsModule>(DirectionsModule)!;

  const actionSystem = world.get(ActionSystem)!;
  const rulesSystem = world.get(RuleSystem)!;
  const scoreSystem = world.get(ScoreSystem)!;
  const player = world.get(Player)!;

  // ********* PLAYER **************
  player.add(examinable, `As good-looking as ever.`);

  // ********* ITEMS **************
  const cloak = new Thing(
    "velvet cloak",
    /cloak|velvet cloak/,
    "A handsome cloak, of velvet trimmed with satin, and slightly spattered with raindrops. Its blackness is so deep that it almost seems to suck light from the room.",
  )
    .add(worn)
    .add(
      examinable,
      `A handsome cloak, of velvet trimmed with satin, and slightly spattered with raindrops. Its blackness is so deep that it almost seems to suck light from the room.`,
    );

  const hook: Supporter = new Supporter(
    "hook",
    /hook|peg/,
    `It's just a small brass hook, screwed to the wall.`,
  )
    .add(fixed)
    .add(scenery)
    .add(
      examinable,
      () =>
        `It's just a small brass hook ${
          hook.has(cloak) ? "with a cloak hanging on it" : "screwed to the wall"
        }.`,
    );

  const message = new Thing(
    "message",
    /message|floor|sawdust/,
  )
    .add(fixed)
    .add(
      readable,
      () =>
        bar.has(disturbed)
          ? `The message has been carelessly trampled, making it difficult to read. You can just distinguish the words...\n\n  *** You have lost ***\n`
          : `The message, neatly marked in the sawdust, reads...\n\n  *** You have won ***\n`,
    )
    .add(scenery);

  // ********* LOCATIONS **************
  const foyer = new Location(
    "Foyer of the Opera House",
    "You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.",
  );

  const cloakRoom = new Location(
    "Cloak room",
    "The walls of this small room were clearly once lined with hooks, though now only one remains. The exit is a door to the east.",
  )
    .add(east, foyer);

  const bar = new Location(
    "Foyer bar",
    `The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.`,
  )
    .add(darkness)
    .add(north, foyer);

  const deadEnd = new Location(
    "Dead End",
    `You've only just arrived, and besides, the weather outside seems to be getting worse.`,
  )
    .add(
      cannotGo,
      `You've only just arrived, and besides, the weather outside seems to be getting worse.`,
    );

  // ********* EXITS **************
  foyer.add(north, deadEnd);
  foyer.add(south, bar);
  foyer.add(west, cloakRoom);

  // Actions
  actionSystem.add(
    syntax`drop ${cloak}`,
    (actor): string | boolean => {
      if (!actor.has(cloak)) return false;
      return `This isn't the best place to leave a smart cloak lying around.`;
    },
  );

  actionSystem.add(
    syntax`read #Determiner? ${message}`,
    (actor) => {
      if (!actor.sees(message)) return false;
      if (!bar.has(disturbed)) scoreSystem.addPoint(); // TODO: make a rule?
      message.add(read);
      return message.get<string>(readable)!;
    },
  );

  actionSystem.add(
    syntax`put #Determiner? ${cloak} on #Determiner? ${hook}`,
    (actor) => {
      if (!actor.sees(cloak) || !actor.sees(hook)) return false;
      if (!actor.has(cloak)) return `${actor} don't have the ${cloak}`;
      if (cloak.has(worn)) {
        cloak.remove(worn);
        actor.say(`You take off the ${cloak}.`);
      }
      scoreSystem.addPoint();
      cloak.moveTo(hook);
      return `You put the ${cloak} on the ${hook}.`;
    },
  );

  actionSystem.add(
    "*",
    (actor: Actor, _: string) => {
      if (!actor.has(cloak) || !actor.isIn(bar)) return false;
      if (_ == "north" || _ == "n" || _ === "go north") return false; // improve this
      bar.add(disturbed);
      return `In the dark? You could easily disturb something!`;
    },
  );

  // ********* Rules **************
  rulesSystem.add(() => {
    if (player.has(cloak)) {
      bar.add(darkness);
    } else {
      bar.remove(darkness);
    }
  });

  rulesSystem.add(() => {
    if (message.has(read)) {
      world.stop();
    }
  });

  // ********* START **************
  player.moveTo(foyer);
  cloak.moveTo(player);
  hook.moveTo(cloakRoom);
  message.moveTo(bar);
}

if (import.meta.main) {
  import("../runner/mod.ts").then(({ run }) => {
    run(CloakGame);
  });
}
