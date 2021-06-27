import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { offable, on, onable } from "./tags.ts";

export function switching(actions: ActionSystem) {
  actions.add(
    (actor: Actor) =>
      syntax`${/turn|switch/} (on|off) #Determiner? ${
        Thing.accessibleBy(actor)
      }`,
    (you: Actor, verb: string, _thing: Thing) =>
      `${you} don't know how ${verb} that on.`,
  );

  // TURN ON
  actions.add(
    (actor: Actor) =>
      syntax`${/turn|switch/} on #Determiner? ${
        Thing.accessibleBy(actor).has(onable)
      }`,
    (_actor: Actor, _: string, thing: Thing) => {
      thing.add(on);
      return thing.get(onable) || `The ${thing} is now on.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/turn|switch/} on #Determiner? ${
        Thing.accessibleBy(actor).has(onable).has(on)
      }`,
    () => `That's already on.`,
  );

  // TURN OFF
  actions.add(
    (actor: Actor) =>
      syntax`(turn|switch) off #Determiner? ${
        Thing.accessibleBy(actor).has(offable).has(on)
      }`,
    (_actor: Actor, thing: Thing) => {
      thing.remove(on);
      return thing.get(offable) || `The ${thing} is now off.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`(turn|switch) off #Determiner? ${
        Thing.accessibleBy(actor).has(offable)
      }`,
    () => `It's not on.`,
  );
}
