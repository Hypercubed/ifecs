import { Engine } from "../ecs/mod.ts";

import { ZorkGame } from "./zork.ts";
import { assertPlay } from "../utils/test-tools.ts";

const { test } = Deno;

test("plays zork", () => {
  const world = new Engine()
    .include(ZorkGame)
    .initialize();

  assertPlay(
    world,
    `
    ZORK
    -= West of House =-
    You are in an open field on the west side of a white house with a boarded front door.
    There is a small mailbox here.
    A rubber mat saying 'Welcome to Zork' lies by the door.
    
    > look
    -= West of House =-
    You are in an open field on the west side of a white house with a boarded front door.
    There is a small mailbox here.
    A rubber mat saying 'Welcome to Zork' lies by the door.

    > wait
    Nothing happens.
    
    > examine mailbox
    It's a small mailbox.

    > x mat
    A rubber mat saying "Welcome to Zork".
    
    > open box
    You open the small mailbox.

    > x mail box
    It's a small mailbox. The small mailbox contains: leaflet.

    > take leaflet
    Taken.

    > read leaflet
    Welcome to Zork!
    
    Zork is a game of adventure, danger, and low cunning.  In it you will explore some of the most amazing territory ever seen by mortal man.  Hardened adventurers have run screaming from the terrors contained within.
    
    In Zork, the intrepid explorer delves into the forgotten secrets of a lost labyrinth deep in the bowels of the earth, searching for vast treasures long hidden from prying eyes, treasures guarded by fearsome monsters and diabolical traps!
    
    No system should be without one!
    
    Zork was created at the MIT Laboratory for Computer Science by Tim Anderson, Marc Blank, Bruce Daniels, and Dave Lebling.  It was inspired by the Adventure game of Crowther and Woods, and the long tradition of fantasy and science fiction games.
    
    > put leaflet in mailbox
    You put the leaflet in the small mailbox.
    
    > close mailbox
    You close the small mailbox.
    
    > open door
    It seams to be locked.

    > get mat
    Taken.

    > inv
    You are carrying:
    rubber welcome mat
    
    > go south
    -= South of House =-
    You are facing the south side of a white house. There is no door here, and all the windows are barred.

    > E
    -= Behind House =-
    You are behind the white house. In one corner of the house is a window that is slightly ajar.

    > open window
    With great effort, you open the window far enough to allow entry.

    > l
    -= Behind House =-
    You are behind the white house. In one corner of the house is a window that is open.

    > enter window
    -= Kitchen =-
    This is the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open.
    There is a table here.
    # On the table is an elongated brown sack, smelling of hot peppers.
    # A bottle is sitting on the table.
    # The glass bottle contains:
    # A quantity of water
    
    > up
    -= Attic =-
    This is the attic. The only exit is a stairway leading down.
    A large coil of rope is lying in the corner.
    On a table is a nasty-looking knife.

    > take rope
    Taken.

    > take knife
    Taken.

    > down
    -= Kitchen =-
    This is the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open.
    There is a table here.
    
    > open bag
    You open the bag.

    > x bag
    A brown bag. The bag contains: garlic.

    > take garlic
    Taken.
    
    > w
    -= Living Room =-
    You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.
    Above the trophy case hangs an elvish sword of great antiquity.
    A battery powered brass lantern is on the trophy case.

    > take lamp
    Taken.

    > take sword
    Taken.

    > inventory
    You are carrying:
    rubber welcome mat
    rope
    knife
    garlic
    lamp
    elvish sword
    
    > open case
    You open the trophy case.
    
    > move rug
    With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.

    > open trap door
    The door reluctantly opens to reveal a rickety staircase descending into darkness.

    > turn on lamp
    The lamp is now on.
    
    > go down
    The trap door crashes shut, and you hear someone barring it.
    
    -= Celler =-
    You are in a dark and damp cellar with a narrow passageway leading north, and a crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.
    
  `,
  );

  world.destroy();
});

test(`can't do`, () => {
  const world = new Engine()
    .include(ZorkGame)
    .initialize();

  assertPlay(
    world,
    `
    ZORK
    -= West of House =-
    You are in an open field on the west side of a white house with a boarded front door.
    There is a small mailbox here.
    A rubber mat saying 'Welcome to Zork' lies by the door.
    
    > go northern
    You can't see any such thing.
    
    > go west
    You can't go that way.
    
    > go blur
    You can't see any such thing.
    
    > blah blah blah
    I don't understand that sentence.
    
    > read leaflet
    You can't see any such thing.
    
    > close mailbox
    That's already closed.
    
    > put leaflet in mailbox
    You can't see any such thing.
    
    > take leaflet
    You can't see any such thing.
    
    > open mailbox
    You open the small mailbox.

    > take leaflet
    Taken.

    > close mailbox
    You close the small mailbox.

    > put leaflet in mailbox
    The small mailbox is closed.

    > take mailbox
    You don't know how to take that.

    > take leaflet
    You already have it.

    > take door
    You don't know how to take that.

    > open door
    It seams to be locked.

    > unlock door
    What do you want to unlock the front door with?

    > unlock door with leaflet
    It doesn't seem to work.
    
    > north
    -= North of House =-
    You are facing the north side of a white house. There is no door here, and all the windows are barred.

    > put leaflet in mailbox
    You can't see any such thing.
    
    > examine mailbox
    You can't see any such thing.

    > e
    -= Behind House =-
    You are behind the white house. In one corner of the house is a window that is slightly ajar.

    > take window
    You don't know how to take that.

    > enter window
    It's closed.

    > go west
    The small window is closed.

    > open window
    With great effort, you open the window far enough to allow entry.

    > enter window
    -= Kitchen =-
    This is the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west, and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open.
    There is a table here.

    > w
    -= Living Room =-
    You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.
    Above the trophy case hangs an elvish sword of great antiquity.
    A battery powered brass lantern is on the trophy case.

    > go down
    You can't go that way.

    > move rug
    With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.

    > go down
    The trap door is closed.
  `,
  );

  world.destroy();
});
