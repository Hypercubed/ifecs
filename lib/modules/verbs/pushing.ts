import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { pushable, pushed } from "./tags.ts";

export function pushing(actions: ActionSystem) {
  actions.add(
    (actor: Actor) =>
      syntax`${/push|move/} #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor, push: string) => `${you} don't know how to ${push} that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(push|move) #Determiner? ${
        Thing.accessibleBy(actor).has(pushable)
      }`,
    (you: Actor, thing: Thing) => {
      thing.add(pushed);
      return thing.get(pushable) || `${you} move the ${thing}.`;
    },
  );
}
