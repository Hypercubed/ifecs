import { Service } from "../../deps.ts";
import { System } from "../../ecs/mod.ts";
import { AnyFunction } from "../../utils/types.ts";

type Rule = AnyFunction<void, never>;

@Service()
export class RuleSystem extends System {
  priority = Infinity;

  private _rules: Rule[] = [];

  add(update: Rule) {
    this._rules.unshift(update);
  }

  update() {
    for (const rule of this._rules) {
      rule();
    }
  }
}
