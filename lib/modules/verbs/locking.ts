import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { lockable, locked } from "./opening.tags.ts";

export function locking(actions: ActionSystem) {
  // UNLOCK
  actions.add(
    (actor: Actor) =>
      syntax`unlock #Determiner? ${
        Thing.accessibleBy(actor)
      } (with #Determiner? ${Thing})`,
    (actor: Actor) => `${actor} don't know how to unlock that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`unlock #Determiner? ${
        Thing.accessibleBy(actor).has(lockable)
      } (with #Determiner? ${Thing})`,
    () => `It doesn't seam to be locked.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`unlock #Determiner? ${
        Thing.accessibleBy(actor).has(lockable).has(locked)
      }`,
    (_: Actor, thing: Thing) => `What do you want to unlock the ${thing} with?`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`unlock #Determiner? ${
        Thing.accessibleBy(actor).has(lockable).has(locked)
      } with #Determiner? ${Thing.accessibleBy(actor)}`,
    () => `It doesn't seem to work.`,
  );

  // LOCK
  actions.add(
    (actor: Actor) =>
      syntax`lock #Determiner? ${
        Thing.accessibleBy(actor)
      } (with #Determiner? ${Thing})`,
    (actor: Actor, _: Thing) => `${actor} don't know how to lock that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`lock #Determiner? ${Thing.accessibleBy(actor).has(lockable)}`,
    (_: Actor, thing: Thing) => `What do you want to lock the ${thing} with?`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`lock #Determiner? ${
        Thing.accessibleBy(actor).has(lockable)
      } with #Determiner? ${Thing.accessibleBy(actor)}`,
    () => `It doesn't seem to work.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`lock #Determiner? ${
        Thing.accessibleBy(actor).has(lockable).has(locked)
      } (with #Determiner? ${Thing})`,
    () => `It seams to be locked already.`,
  );
}
