import { Tag } from "../../../ecs/tags.ts";

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

export const heading = new Tag<string>("Heading");
export const lookable = new Tag( // scenery?  aka initial_desc
  `things/lookable`,
  (_) => `There is a ${_} here.`,
); // aka short_desc
export const examinable = new Tag(`things/examinable`); // rename searchable?, add on_searched?  aka long_desc
export const inventoriable = new Tag(`things/inventoriable`, (_) => `${_}`); // inv_desc
// contains_desc

export const droppable = new Tag(`things/droppable`, ``);
export const scenery = new Tag(`things/scenery`);
export const hidden = new Tag(`things/hidden`);

export const read = new Tag(`things/read`, ``);
export const readable = new Tag(`things/readable`, ``);

export const portable = new Tag(`things/portable`, ``);
export const fixed = new Tag(`things/fixed`, ``); // static

export const openable = new Tag(`things/openable`, ``); // when_open
export const closable = new Tag(`things/closable`, ``); // when_closed
export const closed = new Tag(`things/closed`);
export const open = new Tag(`things/open`);

export const lockable = new Tag(`things/lockable`, ``);
export const unlockable = new Tag(`things/unlockable`, ``);
export const locked = new Tag(`things/locked`);

// accessible/visible contents
export const contentsAccessible = new Tag(`things/contentsAccessible`);
export const contentsVisible = new Tag(`things/contentsVisible`);

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

// moveable, moved
export const pushable = new Tag(`things/pushable`, ``);
export const pushed = new Tag(`things/pushed`);

export const edible = new Tag<string>(`things/edible`, ``);
export const drinkable = new Tag<string>(`things/drinkable`, ``);

export const onEnter = new Tag<string>("ifecs/on-enter");
export const cannotGo = new Tag("ifecs/cannotGo", ``);
export const visited = new Tag(`things/visited`);
