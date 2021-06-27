import { Actor } from "../../entities/actors.ts";
import { Container, Supporter, Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { DONT_KNOW_HOW } from "../what.module.ts";
import { closed, worn } from "./tags.ts";

export function putting(actions: ActionSystem) {
  // PUT IN
  actions.add(
    (actor: Actor) =>
      syntax`put #Determiner? ${Thing.seenBy(actor)} (in|on) #Determiner? ${
        Thing.seenBy(actor)
      }`,
    () => DONT_KNOW_HOW,
  );

  actions.add(
    (actor: Actor) =>
      syntax`put #Determiner? ${Thing.accessibleBy(actor)} in #Determiner? ${
        Container.accessibleBy(actor)
      }`,
    (you: Actor, thing: Thing, container: Container) => {
      if (thing == container) return `Cannot put something inside itself.`;
      thing.moveTo(container as Container);
      return `${you} put the ${thing} in the ${container}.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`put #Determiner? ${Thing.accessibleBy(actor)} in #Determiner? ${
        Container.accessibleBy(actor).has(closed)
      }`,
    (_actor: Actor, _thing: Thing, container: Container) =>
      `The ${container} is closed.`,
  );

  // PUT ON
  actions.add(
    (actor: Actor) =>
      syntax`put #Determiner? ${Thing.accessibleBy(actor)} on #Determiner? ${
        Supporter.accessibleBy(actor)
      }`, // TODO: seenContainer
    (actor: Actor, thing: Thing, supporter: Supporter) => {
      if (thing == supporter) return `Cannot put something on itself.`;
      if (thing.has(worn)) {
        thing.remove(worn);
        actor.say(`${actor} take off the ${thing}.`);
      }
      thing.moveTo(supporter);
      return `${actor} put the ${thing} on the ${supporter}.`;
    },
  );
}
