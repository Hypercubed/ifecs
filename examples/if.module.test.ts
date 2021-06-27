import { Engine, Module, ModuleDecorator } from "../ecs/mod.ts";
import { assertPlay } from "../utils/test-tools.ts";

import { StdLib } from "../lib/modules/std.module.ts";
import { Location } from "../lib/entities/locations.ts";
import { Container, Supporter, Thing } from "../lib/entities/things.ts";
import { Player } from "../lib/entities/actors.ts";
import { Inject } from "../deps.ts";
import {
  closable,
  edible,
  hidden,
  openable,
} from "../lib/modules/verbs/tags.ts";

@ModuleDecorator({
  requires: [
    StdLib,
  ],
})
class TestGame extends Module {
  @Inject(Player)
  private player!: Player;

  onInit() {
    const room = new Location("The Room", `The test room.`);

    const table = new Supporter("table", /table/, "A table")
      .moveTo(room);

    new Thing("blue apple", /apple|red apple/)
      .moveTo(null)
      .add(edible);

    new Thing("red apple", /apple|red apple/)
      .moveTo(room)
      .add(edible);

    new Thing("green apple", /apple|green apple/)
      .moveTo(table)
      .add(edible);

    new Container("red box", /box|red box/, "A large red box.")
      .moveTo(room)
      .add(closable)
      .add(openable);

    new Container("green box", /box|green box/, "A large green box.")
      .moveTo(table)
      .add(closable)
      .add(openable);

    new Container("blue box", /box|blue box/, "A large blue box.")
      .moveTo(null);

    new Thing(
      "invisible red unicorn",
      /unicorn|red unicorn/,
      "You don't see me",
    )
      .moveTo(room)
      .add(hidden);

    new Thing(
      "invisible green unicorn",
      /unicorn|green unicorn/,
      "You don't see me",
    )
      .moveTo(table)
      .add(hidden);

    new Thing(
      "invisible blue unicorn",
      /unicorn|blue unicorn/,
      "You don't see me",
    )
      .moveTo(null)
      .add(hidden);

    new Thing(
      "invisible brown unicorn",
      /unicorn|brown unicorn/,
      "You don't see me",
    )
      .moveTo(this.player)
      .add(hidden);

    this.player.moveTo(room);
  }
}

const { test } = Deno;

test("plays", () => {
  const world = new Engine()
    .include(TestGame)
    .initialize();

  assertPlay(
    world,
    `
    > look
    -= The Room =-
    The test room.
    A table.  On the table: green apple, green box.
    There is a red apple here.
    A large red box.

    > inv
    You are empty handed.

    > examine apple
    There is nothing special about the red apple.

    > take apple
    Taken.

    > take apple
    Taken.

    > i
    You are carrying:
    red apple
    green apple

    > drop apple
    Dropped.

    > drop apple
    Dropped.

    > take green apple
    Taken.

    > drop apple
    Dropped.

    > put the red apple in the box
    You put the red apple in the red box.

    > look
    -= The Room =-
    The test room.
    A table.  On the table: green box.
    A large red box. The red box contains: red apple.
    There is a green apple here.

    > x box
    A large red box. The red box contains: red apple.

    > close box
    You close the red box.

    > close box
    That's already closed.

    > look
    -= The Room =-
    The test room.
    A table.  On the table: green box.
    A large red box.
    There is a green apple here.

    > examine box
    A large red box.

    > take red apple
    You can't see any such thing.

    > take box
    Taken.

    > take red box
    You already have it.

    > inventory
    You are carrying:
    A large red box.

    > open box
    You open the red box.

    > open box
    It's already open.

    > inventory
    You are carrying:
    A large red box. The red box contains: red apple.

    > drop box
    Dropped.

    > put box in box
    Cannot put something inside itself.

    > put green box in red box
    You put the green box in the red box.

    > put self in red box
    I don't know how to do that.

    > take self
    You are always self-possessed.

    > eat red apple
    You eat the red apple. Not bad.

    > eat red box
    You don't know how to eat that.

    > close green box
    You close the green box.

    > examine red box
    A large red box. The red box contains: green box.

    > drop red box
    You don't have it.

    > drop green box
    You don't have it.

    > take blue apple
    You can't see any such thing.

    > take table
    You don't know how to take that.

    > take unicorn
    You can't see any such thing.

    > put green apple in me
    I don't know how to do that.

    > take me
    You are always self-possessed.

    > drop me
    You lack the dexterity.

    > open table
    You don't know how to open that.

    > jump
    You jump on the spot, accomplishing little.

    > climb
    Not here; not now.

    > smell apple
    You don't smell anything unusual.

    > listen to apple
    You hear nothing unexpected.

    > throw apple
    You decide that's not a great idea.

    > kiss apple
    You need to get out more.

    > close red box.  open red box.  take apple.
    You close the red box.
    You open the red box.
    Taken.
    `,
  );

  world.destroy();
});
