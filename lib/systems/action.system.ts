import { Entity, IterativeSystem, Query, Tag } from "../../ecs/mod.ts";

import { Actor } from "../entities/actors.ts";
import { Token } from "../entities/tokens.ts";
import { nlp, Service } from "../../deps.ts";
import { hasTopLevelChoice } from "../../utils/regexp.ts";
import { allPossibleCases } from "../../utils/permutations.ts";

import type {
  Action,
  InputKey,
  ISyntax,
  NonQuery,
  ResolveTuple,
  ThenFunction,
  WhenFunction,
} from "./types/action.ts";

function nonQuery(x: unknown): x is NonQuery {
  return typeof x === "string" || x instanceof RegExp;
}

export function syntax<A extends InputKey[]>(
  strings: TemplateStringsArray,
  ...keys: A
): Partial<ISyntax<A>> {
  return {
    strings: strings.slice(),
    keys,
  };
}

export const actionQueue = new Tag<string[] | null>("ifecs-action", []);

@Service()
export class ActionSystem extends IterativeSystem {
  public readonly query = Actor.filter<Entity>((m) => m.has(actionQueue));

  // deno-lint-ignore no-explicit-any
  private _actions: Action<any>[] = [];

  get actions(): ReadonlyArray<Action> {
    return Array.from(this._actions);
  }

  updateEntity(actor: Actor) {
    const actions = actor.get(actionQueue)!;
    const line = actions.shift();
    if (line) {
      nlp(line)
        .forEach((phrase) => {
          for (const action of this._actions) {
            const { matcher, keys } = this.generateNLPMatcher(actor, action);
            const matchResult = phrase.match(matcher!);
            if (!matchResult.found) continue;

            let returnValue: string | boolean = false;
            matchResult.forEach((rr) => {
              const resolvedArray = this.resolveMatches(keys!, rr);
              if (!resolvedArray) return;
              const cases = resultCases(resolvedArray);
              for (const c of cases) {
                returnValue = action.then!(actor, ...c); /// do it!
                if (typeof returnValue === "string") actor.say(returnValue); // returned a string?  Print it!
                if (returnValue) return;
              }
            });
            if (returnValue) break; // if action method passed, consume the action
          }
        });
    }

    if (actions.length < 1) {
      actor.remove(actionQueue);
    } else {
      this.engine!.requestUpdate();
    }
  }

  add<
    A extends InputKey[],
    R extends string | boolean,
  >(
    when: NonQuery | WhenFunction<A> | Partial<ISyntax<A>>,
    then: ThenFunction<A> | string | boolean,
  ) {
    if (typeof then !== "function") {
      const r = then;
      then = () => r as R;
    }
    if (nonQuery(when)) {
      when = {
        strings: [""],
        keys: [when],
      } as Partial<ISyntax<A>>;
    }
    if (typeof when !== "function") {
      const r = when;
      when = () => r as Partial<ISyntax<A>>;
    }
    const rule = { when, then };
    this._actions.unshift(rule); // added in reverse order
  }

  generateNLPMatcher(
    actor: Actor,
    action: Action,
  ): Partial<ISyntax> {
    const when = action.when(actor);

    let { keys, strings } = when;

    const result = strings![0] ? [strings![0]] : [];

    keys = keys!.map((key, i) => {
      key = (nonQuery(key) || key instanceof Query || key instanceof Token)
        ? key
        : key.getQuery();

      const arg = key instanceof Query
        ? this.getOrMatcher(
          this.engine!.findEntities<Token>(key.base, key.predicate),
        )
        : key instanceof Token
        ? key.match
        : key;

      result.push(`[${arg}]`);
      if (strings![i + 1]) {
        result.push(strings![i + 1]);
      }

      return key;
    });

    return {
      strings,
      keys,
      matcher: `^${result.join("")}$`,
    };
  }

  private getOrMatcher(tokens: readonly Token[]): string {
    return `(${
      tokens.map((t) => {
        if (typeof t.match === "string") {
          return t.match.replace(/^\(/, "").replace(/\)$/, "");
        }
        if (t.match instanceof RegExp && hasTopLevelChoice(t.match.source)) {
          return t.match.source;
        }
        return t.match;
      }).join("|")
    })`;
  }

  private resolveMatches<A extends InputKey[]>(
    keys: A,
    // deno-lint-ignore no-explicit-any
    match: nlp.ExtendedDocument<any, nlp.World, nlp.Phrase>,
  ): Array<Token | string> {
    return keys
      .map((key, i) => {
        return key instanceof Query
          ? this.engine!.findEntities<Token>(key.base, key.predicate)
            .filter((token) => this.fullMatch(token, match.group(i).text())) // TODO: better handle multiple token matches
          : key instanceof Token
          ? key
          : match.group(i).text();
      }) as ResolveTuple<A>;
  }

  private fullMatch(token: Token, text: string) {
    // use nlp#match
    return token.fullMatch(text);
  }
}

function resultCases(
  array: Array<Token | string | Array<Token>>,
): Array<Array<Token | string>> {
  return allPossibleCases(array).map((x) =>
    x.flatMap((y: Token | string) => y)
  );
}
