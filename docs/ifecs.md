# IFECS Quickstart

```ts
export function exampleGame(this: Engine): void {
  const { player, north, south } = world.include(stdLib);

  const forest = new Location(
    "forest",
    `A thick, overgrown forest. Little sunlight penetrates the canopy overhead.\nTo the North is the clearing.`,
  );
  const clearing = new Location(
    "clearing",
    `An unremarkable clearing in the otherwise dense forest. To the South is the forest.`,
  );

  forest.add(north, clearing);
  clearing.add(south, forest);

  const necklace = new Thing(
    "necklace",
    /necklace|chain/,
    "A simple golden necklace. It radiates mystery. You should try it on.",
  )
    .add(wearable)
    .add(edible);

  player.moveTo(forest);
  necklace.moveTo(clearing);
}

run(exampleGame);
```
