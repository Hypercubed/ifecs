import { Service } from "../../deps.ts";
import { Entity } from "../../ecs/entities.ts";
import { Query } from "../../ecs/queries.ts";
import { IterativeSystem, System } from "../../ecs/systems.ts";
import { Tag } from "../../ecs/tags.ts";
import { LazyInitialize } from "../../utils/decorators.ts";

export const springCenter = new Tag("springCenter", { x: 0, y: 0 });
export const position = new Tag("springCenter", { x: 0, y: 0 });
export const lastPosition = new Tag("springCenter", { x: 0, y: 0 });
export const velocity = new Tag("springCenter", { x: 0, y: 0 });
export const acceleration = new Tag("springCenter", { x: 0, y: 0 });
export const mass = new Tag<number>("physics/mass", 1);

export const timeData = new Tag("phyics/time-data", {
  start: 0,
  last: 0,
  tick: -1,
  dt: 0,
  elapsed: 0,
});

export class TimeData extends Entity {
  constructor() {
    super();
    this.add(timeData);
  }
}

export class PhysicsBody extends Entity {
  constructor(x: number, y: number) {
    super();
    this
      .add(position, { x, y })
      .add(lastPosition, { x, y })
      .add(velocity, { x: 0, y: 0 })
      .add(acceleration, { x: 0, y: 0 })
      .add(mass);
  }
}

@Service()
export class TimeDataSystem extends System {
  priority = -Infinity;
  query = new Query(TimeData);

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  update() {
    if (this.time.start === 0) this.time.start = performance.now();
    if (this.time.last === 0) this.time.last = performance.now();
    this.time.tick++;
    const next = performance.now();
    this.time.dt = next - this.time.last;
    this.time.last = next;
    this.time.elapsed = next - this.time.start;
  }
}

@Service()
export class VelocitySystem extends IterativeSystem {
  priority = 0;

  query = PhysicsBody.getQuery();

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  updateEntity(e: Entity) {
    const v = e.get(velocity)!;
    const a = e.get(acceleration)!;

    v.x += a.x * this.time.dt;
    v.y += a.y * this.time.dt;

    a.x = 0;
    a.y = 0;
  }
}

@Service()
export class PositionSystem extends IterativeSystem {
  priority = 1;

  query = PhysicsBody.getQuery();

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  updateEntity(e: Entity) {
    const v = e.get(velocity)!;
    const p = e.get(position)!;

    if (e.has(lastPosition)) {
      const l = e.get(lastPosition)!;
      l.x = p.x;
      l.y = p.y;
    }

    p.x += v.x * this.time.dt;
    p.y += v.y * this.time.dt;
  }
}

@Service()
export class SpringSystem extends IterativeSystem {
  priority = -1;

  query = PhysicsBody.filter(
    (e) =>
      e.has(springCenter) &&
      e.has(mass),
  );

  constructor(public readonly springConstant: number) {
    super();
  }

  updateEntity(e: Entity) {
    const p = e.get(position)!;
    const c = e.get(springCenter)!;
    const a = e.get(acceleration)!;
    const m = e.get(mass)!;

    a.x += this.springConstant * (c.x - p.x) / m;
    a.y += this.springConstant * (c.y - p.y) / m;
  }
}

@Service()
export class DragSystem extends IterativeSystem {
  priority = -1;

  query = PhysicsBody.filter((e) => e.has(mass));

  constructor(public readonly dragCoefficient: number) {
    super();
  }

  updateEntity(e: Entity) {
    const v = e.get(velocity)!;
    const a = e.get(acceleration)!;
    const m = e.get(mass)!;

    a.x -= this.dragCoefficient * v.x / m;
    a.y -= this.dragCoefficient * v.y / m;
  }
}
