import { Tag } from "../../ecs/mod.ts";

export const outputQueue = new Tag<string[][]>("ifecs-output", []);
