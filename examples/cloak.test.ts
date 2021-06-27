import { Engine } from "../ecs/mod.ts";
import { CloakGame } from "./cloak.ts";
import { assertPlay } from "../utils/test-tools.ts";

const { test } = Deno;

test("wins", () => {
  const world = new Engine()
    .include(CloakGame)
    .initialize();

  assertPlay(
    world,
    `
    Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House. It's surprising that there aren't more people about but, hey, what do you expect in a cheap demo game...?
    Cloak of Darkness

    A basic IF demonstration.

    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > W
    -= Cloak room =-
    The walls of this small room were clearly once lined with hooks, though now only one remains. The exit is a door to the east.

    > examine hook
    It's just a small brass hook screwed to the wall.

    # > take hook
    # You don't know how to take that.

    > i
    You are carrying:
    velvet cloak

    > take off cloak
    You take off the velvet cloak.

    > look at the velvet cloak
    A handsome cloak, of velvet trimmed with satin, and slightly spattered with raindrops. Its blackness is so deep that it almost seems to suck light from the room.

    > put cloak on hook
    You put the velvet cloak on the hook.
    [Your score has just gone up by one point.]

    > examine hook
    It's just a small brass hook with a cloak hanging on it.

    > look
    -= Cloak room =-
    The walls of this small room were clearly once lined with hooks, though now only one remains. The exit is a door to the east.

    > east
    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > south
    -= Foyer bar =-
    The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.

    > read message
    The message, neatly marked in the sawdust, reads...

    *** You have won ***

    [Your score has just gone up by one point.]
    In that game you scored 2 out of a possible 2, in 11 turns.
  `,
  );

  world.destroy();
});

test("loses", () => {
  const world = new Engine()
    .include(CloakGame)
    .initialize();

  assertPlay(
    world,
    `
    Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House. It's surprising that there aren't more people about but, hey, what do you expect in a cheap demo game...?
    Cloak of Darkness

    A basic IF demonstration.

    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > go south
    It is pitch dark, and you can't see a thing.

    > look
    In the dark? You could easily disturb something!

    > NORTH
    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > go W
    -= Cloak room =-
    The walls of this small room were clearly once lined with hooks, though now only one remains. The exit is a door to the east.

    > put the cloak on the hook
    You take off the velvet cloak.
    You put the velvet cloak on the hook.
    [Your score has just gone up by one point.]

    > east
    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > south
    -= Foyer bar =-
    The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.

    > read message
    The message has been carelessly trampled, making it difficult to read. You can just distinguish the words...

    *** You have lost ***

    In that game you scored 1 out of a possible 2, in 8 turns.
  `,
  );

  world.destroy();
});

test(`can't`, () => {
  const world = new Engine()
    .include(CloakGame)
    .initialize();

  assertPlay(
    world,
    `
    Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House. It's surprising that there aren't more people about but, hey, what do you expect in a cheap demo game...?
    Cloak of Darkness

    A basic IF demonstration.

    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > go northern
    You can't see any such thing.

    > go east
    You can't go that way.

    > go blur
    You can't see any such thing.

    > blah blah blah
    I don't understand that sentence.

    > x hook
    You can't see any such thing.

    > x blah
    You can't see any such thing.

    > drop cloak
    This isn't the best place to leave a smart cloak lying around.

    > put cloak on hook
    You can't see any such thing.

    > west
    -= Cloak room =-
    The walls of this small room were clearly once lined with hooks, though now only one remains. The exit is a door to the east.

    > put cloak on hook
    You take off the velvet cloak.
    You put the velvet cloak on the hook.
    [Your score has just gone up by one point.]

    > drop cloak
    You don't have it.

    > read message
    You can't see any such thing.
  `,
  );

  world.destroy();
});

test(`stress tests`, () => {
  const world = new Engine()
    .include(CloakGame)
    .initialize();

  assertPlay(
    world,
    `
    Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House. It's surprising that there aren't more people about but, hey, what do you expect in a cheap demo game...?
    Cloak of Darkness

    A basic IF demonstration.

    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > go north. go south.
    You've only just arrived, and besides, the weather outside seems to be getting worse.
    It is pitch dark, and you can't see a thing.

    > north
    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > x me. look
    As good-looking as ever.
    -= Foyer of the Opera House =-
    You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.

    > examine myself.
    As good-looking as ever.

    > examine self?
    As good-looking as ever.

    > score
    Your current score is 0.
  `,
  );

  world.destroy();
});
