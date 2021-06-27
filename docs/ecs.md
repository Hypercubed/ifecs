# ECS Quickstart

```ts
class Move extends System {

}

class Position extends Component {
  constructor(public x: number, public x: number);
}

class Velocity extends Component {
  constructor(public x: number, public x: number);
}

const enemy = new Tag('enemy');
const health = new Tag('health', 100);  

const world = new Engine();
const player = new Entity()
  .add(health, 30)
  .add(new Position(0, 0))
  .add(new Velocity(0, 0));
const monster = new Entity()
  .add(health, 60)
  .add(new Position(10, 10))
  .add(new Velocity(0, 0));
  .add(enemy);

world.add(player, ball);

while (world.update()) { }
```
