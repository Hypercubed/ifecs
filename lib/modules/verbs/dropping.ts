import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { droppable } from "./portable.tags.ts";

export function dropping(actions: ActionSystem) {
  // DROP
  actions.add(
    (actor: Actor) =>
      syntax`(drop|put down) #Determiner? ${Thing.seenBy(actor)}`,
    (you) => `${you} don't have it.`,
  );

  actions.add(
    (actor: Actor) => syntax`(drop|put down) #Determiner? ${actor}`,
    (you) => `${you} lack the dexterity.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(drop|put down) #Determiner? ${Thing.hadBy(actor)}`,
    (you: Actor) => `${you} can't do that right now.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(drop|put down) #Determiner? ${Thing.hadBy(actor).has(droppable)}`,
    (actor: Actor, thing: Thing) => {
      thing.moveTo(actor.container);
      return thing.get(droppable) || `Dropped.`;
    },
  );
}
