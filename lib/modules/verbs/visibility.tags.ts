import { Tag } from "../../../ecs/mod.ts";

export const heading = new Tag<string>("Heading");
export const lookable = new Tag( // scenery?  aka initial_desc
  `things/lookable`,
  (_) => `There is a ${_} here.`,
); // aka short_desc
export const examinable = new Tag(`things/examinable`); // rename searchable?, add on_searched?  aka long_desc
export const inventoriable = new Tag(`things/inventoriable`, (_) => `${_}`); // inv_desc
// contains_desc

export const scenery = new Tag(`things/scenery`);
export const hidden = new Tag(`things/hidden`);

// accessible/visible contents
export const contentsAccessible = new Tag(`things/contentsAccessible`);
export const contentsVisible = new Tag(`things/contentsVisible`);
