import { Tag } from "../../../ecs/tags.ts";

export const portable = new Tag(`things/portable`, ``);
export const fixed = new Tag(`things/fixed`, ``); // static

// moveable, moved
export const pushable = new Tag(`things/pushable`, ``);
export const pushed = new Tag(`things/pushed`);

export const droppable = new Tag(`things/droppable`, ``);
