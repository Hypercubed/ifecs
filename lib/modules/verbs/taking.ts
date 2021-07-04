import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { DONT_KNOW_HOW } from "../what.module.ts";
import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { fixed, portable } from "./portable.tags.ts";

export function taking(actions: ActionSystem) {
  actions.add(
    (actor: Actor) =>
      syntax`(take|get|pick up|carry) #Determiner? ${Thing.seenBy(actor)}`,
    () => DONT_KNOW_HOW,
  );

  actions.add(
    (actor: Actor) =>
      syntax`${"(take|get|pick up|carry)"} ${Thing.accessibleBy(actor)}`,
    (you: Actor, take: string) => `${you} don't know how to ${take} that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(take|get|pick up|carry) #Determiner? ${Thing.hadBy(actor)}`,
    (you: Actor) => `${you} already have it.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`${"(take|get|pick up|carry)"} ${
        Thing.accessibleBy(actor).has(portable)
      }`,
    (actor: Actor, _, thing: Thing) => {
      if (actor.has(thing)) return false; // Need to return false, in case another matching item is seen
      thing.moveTo(actor);
      return thing.get(portable) || `Taken.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`${"(take|get|pick up|carry)"} ${
        Thing.accessibleBy(actor).has(fixed)
      }`,
    (you: Actor, take: string, thing: Thing) => {
      return thing.get(fixed) || `${you} don't know how to ${take} that.`;
    },
  );

  actions.add(
    (actor: Actor) => syntax`(take|get|pick up|carry) ${actor}`,
    (you: Actor) => `${you} are always self-possessed.`,
  );
}
