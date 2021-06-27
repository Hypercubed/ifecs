import { Actor } from "../../entities/actors.ts";
import { Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { closable, closed, locked, openable } from "./tags.ts";

export function opening(actions: ActionSystem) {
  // OPEN
  actions.add(
    (actor: Actor) => syntax`open #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor, _: Thing) => `${you} don't know how to open that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`open #Determiner? ${Thing.accessibleBy(actor).has(openable)}`,
    () => `It's already open.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`open #Determiner? ${
        Thing.accessibleBy(actor).has(openable).has(closed)
      }`,
    (_: Actor, thing: Thing) => {
      thing.remove(closed);
      return thing.get<string>(openable) || `You open the ${thing}.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`open #Determiner? ${
        Thing.accessibleBy(actor).has(openable).has(locked)
      }`,
    () => `It seams to be locked.`,
  );

  // CLOSE
  actions.add(
    (actor: Actor) =>
      syntax`${/close|shut/} #Determiner? ${Thing.accessibleBy(actor)}`,
    (you: Actor, close: string, __: Thing) =>
      `${you} don't know how to ${close} that.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/close|shut/} #Determiner? ${
        Thing.accessibleBy(actor).has(closable)
      }`,
    (_you: Actor, _close: string, thing: Thing) => {
      thing.add(closed);
      return thing.get<string>(closable) || `You close the ${thing}.`;
    },
  );

  actions.add(
    (actor: Actor) =>
      syntax`${/close|shut/} #Determiner? ${
        Thing.accessibleBy(actor).has(closable).has(closed)
      }`,
    () => `That's already closed.`,
  );
}
