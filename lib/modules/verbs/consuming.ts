import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { drinkable, edible } from "./tags.ts";

export function consuming(actions: ActionSystem) {
  // EAT
  actions.add(
    (actor: Actor) => syntax`eat #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor) => `${you} don't know how to eat that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`eat #Determiner? ${Thing.accessibleBy(actor).has(edible)}`,
    (you: Actor, thing: Thing) => {
      thing.moveTo(null);
      return thing.get(edible) || `${you} eat the ${thing}. Not bad.`;
    },
  );

  // DRINK
  actions.add(
    (actor: Actor) =>
      syntax`${/drink|sip/} #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor, drink: string) => `${you} don't know how to ${drink} that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/drink|sip/} #Determiner? ${
        Thing.accessibleBy(actor).has(drinkable)
      }`,
    (you: Actor, drink: string, thing: Thing) => {
      thing.moveTo(null);
      return thing.get(drinkable) || `${you} ${drink} the ${thing}. Not bad.`;
    },
  );
}
