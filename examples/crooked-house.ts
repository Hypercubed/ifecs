#!/usr/bin/env -S deno run --unstable --allow-all

import { bold, Inject } from "../deps.ts";
import { Module, ModuleDecorator } from "../ecs/mod.ts";
import { Actor, Player } from "../lib/entities/actors.ts";
import { Container, Supporter, Thing } from "../lib/entities/things.ts";
import { StdLib } from "../lib/modules/std.module.ts";
import { Location } from "../lib/entities/locations.ts";
import { Portal } from "../lib/entities/portals.ts";
import { DirectionsModule } from "../lib/modules/directions.module.ts";
import { Direction } from "../lib/entities/directions.ts";
import { ActionSystem, syntax } from "../lib/systems/action.system.ts";
import { DOES_NOT_WORK, YOU_CANT_SEE_IT } from "../lib/modules/what.module.ts";
import {
  closable,
  closed,
  drinkable,
  examinable,
  fixed,
  hidden,
  locked,
  lookable,
  openable,
  pushable,
  readable,
  scenery,
  unlockable,
  worn,
} from "../lib/modules/verbs/tags.ts";

@ModuleDecorator({
  requires: [
    StdLib,
  ],
})
export class CrookedHouseGame extends Module {
  @Inject(Player)
  protected player!: Player;

  @Inject(DirectionsModule)
  protected directions!: DirectionsModule;

  @Inject(ActionSystem)
  protected actions!: ActionSystem;

  onInit() {
    const { up, down } = this.directions;
    const ne = new Direction("North East", "(northeast|north east|ne)");
    const nw = new Direction("North West", "(northwest|north west|nw)");
    const se = new Direction("South East", "(southeast|south east|se)");
    const sw = new Direction("South West", "(northwest|north west|sw)");

    /** ROOMS */
    const HALL = new Location("Entrance hall")
      .add(lookable, () => {
        HALL.add(lookable, `The entrance hall is in perfect order.`);
        return `The entrance hall is in perfect order, the sliding screens that separated it from the garage space were back, permitting you to see the entire compartment.`;
      });

    const CENTRAL = new Location("Central Room")
      .add(lookable, () => {
        CENTRAL.add(
          lookable,
          `The middle of the five rooms which constituted the second floor of the original structure.`,
        );
        return `The middle of the five rooms which constituted the second floor of the original structure.  Before them, through an open doorway a translucent partition lay the kitchen, a chef's dream of up-to-the-minute domestic engineering, monel metal, continuous counter space, concealed lighting, functional arrangement. On the left the formal, yet gracious and hospitable dining room awaited guests, its furniture in parade-ground alignment. Teal knew before he turned his head that the drawing room and lounge would be found in equally substantial and impossible existence.`;
      });

    const LOUNGE = new Location(
      "Lounge Room",
      `The lounge.  Long drapes that covered the deep French windows set in one side wall of the lounge.`,
    );

    const DINING = new Location(
      "Dining room",
      `The formal, yet gracious and hospitable dining room awaited guests, its furniture in parade-ground alignment.`,
    );
    const DRAWING = new Location("Drawing room", `The drawing room.`);
    const KITCHEN = new Location(
      "Kitchen",
      `The kitchen, a chef's dream of up-to-the-minute domestic engineering, monel metal, continuous counter space, concealed lighting, functional arrangement.`,
    );

    const BEDROOM = new Location("Master Bedroom", `The master bedroom.`)
      .add(lookable, () => {
        BEDROOM.add(lookable, `The master bedroom.`);
        return `The master bedroom.  Its shades were drawn, as had been those on the level below, but the mellow lighting came on automatically.`;
      });

    const STUDY = new Location("Study", `The top floor study.`);

    /** THINGS */
    const WALLS: Supporter = new Supporter("walls", /walls|wall/)
      .add(scenery)
      .add(examinable, () => {
        SWITCH.remove(hidden);
        return `There is nothing much on the ${WALLS} except an ordinary light switch.`;
      })
      .moveTo(HALL);

    const SWITCH: Thing = new Thing("light switch", /light switch|switch/)
      .add(fixed)
      .add(scenery)
      .add(examinable, () => {
        BUTTON.remove(hidden);
        return `On close examination you notice a small button below the ${SWITCH}.`;
      })
      .moveTo(WALLS);

    const BUTTON = new Thing("button")
      .add(fixed)
      .add(hidden)
      .add(scenery)
      .moveTo(WALLS);

    const BAR = new Supporter("bar", /bar/)
      .moveTo(LOUNGE);

    new Thing("hat", /hat/, `On the sweat band are the initials 'Q.T.'.`)
      .moveTo(this.player)
      .add(worn);

    const PAINTING = new Thing("painting", /painting|picture/)
      .add(
        fixed,
        `It's fixed to the wall.  It looks like you might be able ot push it to the side.`,
      )
      .add(pushable, (_) => {
        PAINTING.remove(pushable);
        SAFE.remove(hidden);
        return `You move the ${_} revealing a wall safe.`;
      })
      .moveTo(BEDROOM);

    const SAFE = new Container("safe", /safe|wall safe/)
      .add(hidden)
      .add(closed).add(openable)
      .add(locked).add(unlockable)
      .moveTo(BEDROOM);

    const KEY = new Thing("key")
      .moveTo(SAFE);

    new Thing("a glass of brandy", /brandy|glass/)
      .add(drinkable)
      .moveTo(BAR);

    // TODO: onEnter
    const DOOR = new Portal("Front door", /door|front door/)
      .add(locked)
      .moveTo(HALL)
      .connects(LOUNGE, HALL);

    LOUNGE.remove(DOOR);

    const DESK = new Supporter(
      "desk",
      `The desk is a mess; overlapping piles of paper, inches high.`,
    )
      .moveTo(STUDY);

    const NOTE = new Thing("crumpled note", /note|crumpled note/)
      .moveTo(DESK)
      .add(readable, `It's too crumpled.`);

    /** DOORS */
    HALL.add(nw, DOOR);

    CENTRAL.add(up, BEDROOM);

    CENTRAL.add(se, KITCHEN);
    CENTRAL.add(nw, LOUNGE);
    CENTRAL.add(ne, DINING);
    CENTRAL.add(sw, DRAWING);

    BEDROOM.add(up, STUDY);
    BEDROOM.add(down, CENTRAL);

    STUDY.add(up, HALL);
    STUDY.add(down, BEDROOM);

    KITCHEN.add(nw, CENTRAL);
    DINING.add(sw, CENTRAL);
    LOUNGE.add(se, CENTRAL);
    DRAWING.add(ne, CENTRAL);

    const STAIRS = new Portal(
      "Stairs",
      /stairs/,
      "Its strength members were the frosty silver of duralumin, its tread and risers transparent plastic.",
    )
      .add(hidden)
      .add(scenery) // lookable, leading up, leading down
      .remove(closed)
      .remove(openable)
      .remove(closable)
      .connects(HALL, CENTRAL);

    // new Portal('Stairs')
    //   .connects(CENTRAL, CENTRAL);

    /** ACTIONS */
    this.actions.add(
      syntax`unlock #Determiner? ${SAFE} with #Determiner? ${/\d+/}`,
      (actor: Actor, thing: Thing, code: string) => {
        if (!actor.accessible(thing)) return YOU_CANT_SEE_IT;
        if (code !== "1234") return DOES_NOT_WORK;
        thing.remove(locked);
        return `${actor} hear a clock.  The safe is now unlocked.`;
      },
    );

    // Move to module?
    this.actions.add(
      syntax`unlock #Determiner? ${DOOR} with #Determiner? ${KEY}`,
      (actor: Actor, door: Thing, key: Thing) => {
        if (!actor.accessible(door) || !actor.accessible(key)) {
          return YOU_CANT_SEE_IT;
        }
        DOOR.remove(locked);
        return `The ${door} is now unlocked.`;
      },
    );

    this.actions.add(
      syntax`(flatten|smooth|smooth out) #Determiner? ${NOTE}`,
      (actor: Actor, thing: Thing) => {
        if (!actor.accessible(thing)) return YOU_CANT_SEE_IT;
        thing.add(readable, `It says only 1234.`);
        return `You smooth out the crumpled note.  You might be able to read it now.`;
      },
    );

    this.actions.add(
      syntax`(push|press) #Determiner? ${BUTTON}`,
      (actor: Actor, thing: Thing) => {
        if (!actor.accessible(thing)) return YOU_CANT_SEE_IT;
        HALL.add(up, STAIRS);
        CENTRAL.add(down, STAIRS);
        STAIRS.remove(hidden);
        return `${actor} push the ${BUTTON} below the ${SWITCH}; a panel in the ceiling falls away and a light, graceful flight of stairs swing noiselessly down.  Howsomever it doesn't seem to go any place—.`;
      },
    );

    this.player
      .moveTo(HALL);
  }

  onStart() {
    this.player.say(
      `
THE HOUSE OF THE FUTURE!!!

COLOSSAL—AMAZING—REVOLUTIONARY
SEE HOW YOUR GRANDCHILDREN WILL LIVE!
Q. TEAL, ARCHITECT`,
    );
    this.player.say();
    this.player.say(bold("—And He Built a Crooked House—"));
    this.player.say();
    this.player.say(this.player.look());
  }
}

if (import.meta.main) {
  import("../runner/mod.ts").then(({ run }) => {
    run(CrookedHouseGame);
  });
}
