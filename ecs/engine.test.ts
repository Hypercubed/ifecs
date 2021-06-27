import { Service } from "../deps.ts";
import { assert, assertEquals, spy } from "../test_deps.ts";

import { Engine } from "./engine.ts";
import { Entity } from "./entities.ts";
import { System } from "./systems.ts";

const { test } = Deno;

const world = new Engine();
const entity = new Entity();

const systemSpy = spy();

@Service()
class TestSystem extends System {
  update() {
    systemSpy(this.priority);
  }
}

const system1 = new TestSystem();
const system2 = new TestSystem();
const system3 = new TestSystem();

system1.priority = 100;
system2.priority = 200;
system3.priority = 300;

class MyEntityClass extends Entity {
}
const myEntity = new MyEntityClass();

test(`init`, () => {
  assertEquals(world.entities.length, 0);
  assertEquals(world.systems.length, 0);
  assertEquals(world.running, false);
});

test(`adds entities`, () => {
  world.add(entity);
  assertEquals(world.entities.length, 1);
  assert(world.has(entity));
});

test(`adds entities and track by class`, () => {
  world.add(myEntity);

  assertEquals(world.entities.length, 2);
  assertEquals(world.findEntities(MyEntityClass), [myEntity]);
  assert(world.has(myEntity));
});

test(`adds and runs system`, () => {
  world.add(system1);
  world.update();

  assertEquals(world.systems.length, 1);
  assert(world.has(system1));
  assertEquals(systemSpy.calls.length, 1);
  systemSpy.calls.splice(0, systemSpy.calls.length);
});

test(`adds system with prority`, () => {
  world.add(system2);
  world.add(system1); // doesn't add same system twice
  world.add(system3);
  world.update();

  assertEquals(world.systems.length, 3);
  assertEquals(world.systems, [system1, system2, system3]);
  assertEquals(systemSpy.calls.length, 3);
  assertEquals(systemSpy.calls.map(({ args }) => args[0]), [100, 200, 300]);
});

// test(`include`, () => {
//   const modTest = spy();

//   world.include(modTest);

//   assertEquals(modTest.calls.length, 1);
//   assertEquals(modTest.calls[0].self, world);
// });
