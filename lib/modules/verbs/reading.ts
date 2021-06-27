import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { read, readable } from "./tags.ts";

export function reading(actions: ActionSystem) {
  actions.add(
    (actor: Actor) => syntax`read #Determiner? ${Thing.seenBy(actor)}`,
    (you: Actor) => `${you} don't know how to read that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`read #Determiner? ${Thing.seenBy(actor).has(readable)}`,
    (you: Actor, thing: Thing) => {
      thing.add(read);
      return thing.get(readable) || `${you} read the ${thing}.`;
    },
  );
}
