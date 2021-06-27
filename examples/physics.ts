#!/usr/bin/env -S deno run --unstable --allow-all
import {
  Engine,
  IterativeSystem,
  Module,
  ModuleDecorator,
  System,
  SystemGroup,
  Tag,
} from "../ecs/mod.ts";

import {
  DragSystem,
  lastPosition,
  mass,
  PhysicsBody,
  position,
  PositionSystem,
  springCenter,
  SpringSystem,
  TimeData,
  timeData,
  TimeDataSystem,
  velocity,
  VelocitySystem,
} from "../lib/systems/kenetics.ts";

import {
  bold,
  dim,
  Inject,
  rgb8,
  Service,
  tty,
  writeAllSync,
} from "../deps.ts";
import { LazyInitialize } from "../utils/decorators.ts";
import { FPSDisplay } from "../lib/systems/fps.system.ts";

const character = new Tag("character", " ");

const TEXT = `
   IIIII FFFFFFF EEEEEEE  CCCCC   SSSSS  
    III  FF      EE      CC    C SS      
    III  FFFF    EEEEE   CC       SSSSS  
    III  FF      EE      CC    C      SS 
   IIIII FF      EEEEEEE  CCCCC   SSSSS`;

let TEXT_WIDTH = 0;
const ARR = TEXT.split("\n").map((l) => {
  TEXT_WIDTH = Math.max(TEXT_WIDTH, l.length);
  return l.split("");
});
const TEXT_HEIGHT = ARR.length;

const { stdout } = Deno;
const { columns, rows } = Deno.consoleSize(stdout.rid);
const { encode } = new TextEncoder();

const MIN_WIDTH = 0;
const MIN_HEIGHT = 2;

const MAX_WIDTH = Math.max(columns - 25, 80);
const MAX_HEIGHT = Math.min(rows - 2, 15);

const PAD = 2;
const HEIGHT = Math.min(TEXT_HEIGHT + PAD, MAX_HEIGHT);
const WIDTH = Math.min(TEXT_WIDTH + PAD, MAX_WIDTH);

const BLANK = (" ".repeat(MAX_WIDTH) + "\n").repeat(MAX_HEIGHT);

class Character extends PhysicsBody {
  constructor(x: number, y: number, x0: number, y0: number, c: string) {
    super(x0, y0);
    this
      .add(springCenter, { x, y })
      .add(character, c) // rgb8(c, c.charCodeAt(0))
      .remove(mass);
  }
}

// TODO: frame skipping?
@Service()
class RenderSystem extends System {
  priority = 100000;
  query = Character.getQuery();

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  update() {
    this.checkEngine();
    const entities = this.engine!.findEntities(this.query.base);

    const arr = BLANK.split("\n").map((s) => s.split(""));

    let sv = 0;

    entities.forEach((e) => {
      const c = e.get(character)!;
      const p = e.get(position)!;
      const v = e.get(velocity)!;

      const cc = rgb8(c, c.charCodeAt(0));

      // Trailer
      const l = e.get(lastPosition)!;
      const lx = Math.round(l.x);
      const ly = Math.round(l.y);
      if (lx >= 0 && lx < MAX_WIDTH && ly >= 0 && ly < MAX_HEIGHT) {
        arr[ly][lx] = dim(cc);
      }

      sv = v.x ** 2 + v.y ** 2;

      const x = Math.round(p.x);
      const y = Math.round(p.y);

      if (x >= 0 && x < MAX_WIDTH && y >= 0 && y < MAX_HEIGHT) {
        arr[y][x] = bold(cc);
      }
    });

    const ss = arr.map((ss) => ss.join("")).join(
      "\n" + tty.ESC + tty.CLEAR_RIGHT,
    );
    const o = encode(ss);

    tty.hideCursorSync();
    tty.writeSync(tty.SAVE, Deno.stdout);
    tty.goToSync(MIN_WIDTH, MIN_HEIGHT);
    writeAllSync(stdout, o);
    tty.writeSync(tty.RESTORE, Deno.stdout);
    tty.showCursorSync();

    if (this.time.elapsed > 20000 && sv < 1e-10) {
      this.engine!.stop();
    }
  }
}

@Service()
class Kick extends IterativeSystem {
  priority = -1000;
  query = Character.getQuery();

  @LazyInitialize
  get time() {
    return this.engine!.findEntities(TimeData)[0]!.get(timeData)!;
  }

  updateEntity(e: Character) {
    if (this.time.elapsed < 5000) return;
    if (!e.has(mass)) {
      const v = e.get(velocity)!;
      v.x = rnd() / 4;
      v.y = rnd() / 4;
      e.add(mass, 1);
    }
  }
}

@Service()
class PhysicsSystems extends SystemGroup {
  systems = [
    new TimeDataSystem(),
    new Kick(),
    new SpringSystem(1e-5),
    new DragSystem(0.001),
    new VelocitySystem(),
    new PositionSystem(),
    new RenderSystem(),
  ];
}

export function physics(this: Engine) {
  new TimeData();

  ARR.forEach((arr, y) => {
    arr.forEach((c, x) => {
      if (c.trim()) {
        const x0 = WIDTH / 2 + 2 * ("IFECS".indexOf(c)) - 4;
        const y0 = HEIGHT / 2;
        new Character(x, y, x0, y0, c);
      }
    });
  });

  "v0.0.0".split("").forEach((c, i) => {
    const x0 = WIDTH / 2;
    const y0 = HEIGHT / 2 + 1;
    new Character(TEXT_WIDTH - 5 + i, TEXT_HEIGHT + 1, x0 + i, y0, c);
  });
}

@ModuleDecorator({
  systems: [
    PhysicsSystems,
    FPSDisplay,
  ],
})
export class PhysicsExample extends Module {
  @Inject(Engine)
  private engine!: Engine;

  onInit() {
    physics.call(this.engine);
  }
}

if (import.meta.main) {
  tty.clearScreen();

  new Engine()
    .include(PhysicsExample)
    .initialize()
    .loop(60);

  for await (const _ of Deno.signal(Deno.Signal.SIGINT)) {
    Deno.exit();
  }
}

function rnd() {
  return Math.random() - 0.5;
}
