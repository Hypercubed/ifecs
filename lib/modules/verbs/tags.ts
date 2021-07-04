import { Tag } from "../../../ecs/tags.ts";

export * from "./opening.tags.ts";
export * from "./consuming.tags.ts";
export * from "./portable.tags.ts";
export * from "./visibility.tags.ts";

// enterable
// transparent
// concealed
// animated/living

// description
// capacity!
// lit
// known

// container
// supporter
// key_object

export const read = new Tag(`things/read`, ``);
export const readable = new Tag(`things/readable`, ``);

// supporter, container tag

export const wearable = new Tag(`things/wearable`, ``);
export const removable = new Tag(`things/removable`, ``);
export const worn = new Tag(`things/worn`);

export const dark = new Tag(`things/dark`);
export const darkness = new Tag("ifecs/darkness");

// switchable, on, off, switchedon, switchedoff
export const onable = new Tag(`things/onable`, ``);
export const offable = new Tag(`things/offable`, ``);
export const on = new Tag(`things/on`);

export const enterable = new Tag("ifecs/enterable", ``);
export const unenterable = new Tag("ifecs/unenterable", ``);
export const visited = new Tag(`things/visited`);
