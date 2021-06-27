import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { wearable, worn } from "./tags.ts";

export function wearing(actions: ActionSystem) {
  // WEAR
  actions.add(
    (actor: Actor) =>
      syntax`(wear|put on) #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor) => `${you} don't have it`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/wear|put on/} #Determiner? ${Thing.hadBy(actor)}`,
    (you: Actor, wear: string) => `${you} don't know how to ${wear} that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(wear|put on) #Determiner? ${Thing.hadBy(actor).has(wearable)}`,
    (you: Actor, thing: Thing) => {
      thing.moveTo(you);
      thing.add(worn);
      return thing.get(wearable) || `${you} start wearing the ${thing}.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/wear|put on/} #Determiner? ${Thing.hadBy(actor).has(worn)}`,
    (you: Actor) => `${you} are already wearing it.`,
  );

  // REMOVE
  actions.add(
    (actor: Actor) =>
      syntax`(take off|remove) #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor) => `${you} don't have it`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(take off|remove) #Determiner? ${Thing.hadBy(actor)}`,
    (you: Actor, thing: Thing) => `${you} are not wearing the ${thing}.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(take off|remove) #Determiner? ${Thing.hadBy(actor).has(worn)}`,
    (you: Actor, thing: Thing) => {
      thing.remove(worn);
      return `${you} take off the ${thing}.`;
    },
  );
}
