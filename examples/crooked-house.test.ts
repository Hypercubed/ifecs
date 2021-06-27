import { Engine } from "../ecs/mod.ts";
import { assertPlay } from "../utils/test-tools.ts";
import { CrookedHouseGame } from "./crooked-house.ts";

const { test } = Deno;

test("plays", () => {
  const world = new Engine()
    .include(CrookedHouseGame)
    .initialize();

  assertPlay(
    world,
    `

    THE HOUSE OF THE FUTURE!!!
    COLOSSAL—AMAZING—REVOLUTIONARY
    SEE HOW YOUR GRANDCHILDREN WILL LIVE!
    Q. TEAL, ARCHITECT
    —And He Built a Crooked House—
    -= Entrance hall =-
    The entrance hall is in perfect order, the sliding screens that separated it from the garage space were back, permitting you to see the entire compartment.
    There is a Front door here.

    > open door
    It seams to be locked.

    > examine walls
    There is nothing much on the walls except an ordinary light switch.

    > examine switch
    On close examination you notice a small button below the light switch.

    > push button
    You push the button below the light switch; a panel in the ceiling falls away and a light, graceful flight of stairs swing noiselessly down.  Howsomever it doesn't seem to go any place—.

    > up
    -= Central Room =-
    The middle of the five rooms which constituted the second floor of the original structure.  Before them, through an open doorway a translucent partition lay the kitchen, a chef's dream of up-to-the-minute domestic engineering, monel metal, continuous counter space, concealed lighting, functional arrangement. On the left the formal, yet gracious and hospitable dining room awaited guests, its furniture in parade-ground alignment. Teal knew before he turned his head that the drawing room and lounge would be found in equally substantial and impossible existence.

    > up
    -= Master Bedroom =-
    The master bedroom.  Its shades were drawn, as had been those on the level below, but the mellow lighting came on automatically.
    There is a painting here.

    > up
    -= Study =-
    The top floor study.
    desk.  On the desk: crumpled note.

    > take note
    Taken.

    > flatten note
    You smooth out the crumpled note.  You might be able to read it now.

    > read note
    It says only 1234.

    > down
    -= Master Bedroom =-
    The master bedroom.
    There is a painting here.

    > move picture
    You move the painting revealing a wall safe.

    > unlock safe with 1234
    You hear a clock.  The safe is now unlocked.

    > open safe
    You open the safe.

    > take key
    Taken.

    > u
    -= Study =-
    The top floor study.
    desk.

    > u
    -= Entrance hall =-
    The entrance hall is in perfect order.
    There is a Front door here.

    > unlock door with key
    The Front door is now unlocked.

    > open door
    You open the Front door.

    > nw
    -= Lounge Room =-
    The lounge.  Long drapes that covered the deep French windows set in one side wall of the lounge.
    bar.  On the bar: a glass of brandy.
    
    `,
  );
});
