import { Tag } from "../../../ecs/mod.ts";

export const openable = new Tag(`things/openable`, ``);
export const closable = new Tag(`things/closable`, ``);
export const closed = new Tag(`things/closed`);

export const lockable = new Tag(`things/lockable`, ``);
export const unlockable = new Tag(`things/unlockable`, ``);
export const locked = new Tag(`things/locked`);
