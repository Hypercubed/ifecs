import { Actor } from "../../entities/actors.ts";
import { Container, Supporter, Thing } from "../../entities/things.ts";
import { ActionSystem, syntax } from "../../systems/action.system.ts";
import { YOU_CANT_SEE_IT } from "../what.module.ts";
import { examinable } from "./visibility.tags.ts";

export function examining(actions: ActionSystem) {
  actions.add(
    syntax`(examine|x|look at) *`,
    () => YOU_CANT_SEE_IT,
  );

  actions.add(
    (actor: Actor) =>
      syntax`$(examine|x|look at) #Determiner? ${Thing.seenBy(actor)}`,
    (you: Actor, thing: Thing) =>
      `${you} see nothing unusual about the ${thing}.`,
  );

  actions.add(
    (actor: Actor) =>
      syntax`(examine|x|look at) #Determiner? ${
        Thing.seenBy(actor).has(examinable)
      }`,
    (_actor: Actor, thing: Thing) => {
      const e = thing.get(examinable)!;
      if (typeof e === "string") return e;
      return `There is nothing special about the ${thing}.`;
    },
  );

  // Container
  actions.add(
    (actor: Actor) =>
      syntax`${"(examine|x|look at)"} #Determiner? ${
        Container.seenBy(actor).has(examinable)
      }`,
    (_actor: Actor, _: string, thing: Container) => {
      const e = thing.get(examinable)!;
      if (typeof e === "string") return e;

      let r = thing.description;
      const visibleContents = thing.contents.filter((t) =>
        thing.hasVisibleChild(t)
      );
      if (visibleContents.length > 0) {
        r += ` The ${thing.name} contains: ${visibleContents.join(", ")}.`;
      }
      return r;
    },
  );

  // Supporter
  actions.add(
    (actor: Actor) =>
      syntax`${"(examine|x|look at)"} #Determiner? ${
        Supporter.seenBy(actor).has(examinable)
      }`,
    (_actor: Actor, _: string, thing: Supporter) => {
      const e = thing.get(examinable)!;
      if (typeof e === "string") return e;

      let r = thing.description;
      const visibleContents = thing.contents.filter((t) =>
        thing.hasVisibleChild(t)
      );
      if (visibleContents.length > 0) {
        r += ` On the ${thing.name} is: ${visibleContents.join(", ")}.`;
      }
      return r;
    },
  );
}
