import { assert, assertEquals } from "../test_deps.ts";

import { Component } from "./components.ts";
import { Entity } from "./entities.ts";
import { Tag } from "./tags.ts";

const tag = new Tag();

class Position extends Component {
  constructor(public x = 0, public y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

const { test } = Deno;

const entity = new Entity();
entity.add(new Position(1, 2));
entity.add(tag);

test("Components", () => {
  test("adds and finds components", () => {
    assert(entity.has(Position));

    const position = entity.get(Position);
    assertEquals(position!.x, 1);
    assertEquals(position!.y, 2);
  });

  test("add overrides previous components", () => {
    entity.add(new Position(3, 5));
    assert(entity.has(Position));
    const position = entity.get(Position);
    assertEquals(position!.x, 3);
    assertEquals(position!.y, 5);
  });

  test("can update component data", () => {
    const position = entity.get(Position);
    position!.x = 8;
    assertEquals(position!.x, 3);
    assertEquals(position!.y, 8);
  });

  test("can remove component", () => {
    entity.remove(Position);
    assert(!entity.has(Position));
  });
});

test("Tags", () => {
  test("adds and finds tags", () => {
    assert(entity.has(tag));
    const value = entity.get(tag);
    assertEquals(value, true);
  });

  test("add overrides previous tags", () => {
    entity.add(tag, `hello`);
    assert(entity.has(tag));
    const value = entity.get(tag);
    assertEquals(value, `hello`);
  });

  test("can remove tag", () => {
    entity.remove(tag);
    assert(!entity.has(tag));
  });
});
