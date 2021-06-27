### Rules

```ts
const rules = world.get(RulesSystem)!;

rules.add(
  Thing,
  (thing: Thing) => {
    if (thing.has(fixed)) {
      thing.add(portable);
    }
  },
);

rules.add(
  () => {
    if (message.has(read)) {
      world.stop();
    }
  },
);
```

### before, instead, after

```ts
const TAKE = syntax`put ${Thing} on ${Supporter}`;

actions.add(TAKE, (actor: Actor, thing: Thing, supporter: Supported) => `You're already carrying ${thing}`);

new Thing('thing')
  .on(TAKE.before, (actor: Actor, thing: Thing, supporter: Supported) => { ... })
  .on(TAKE.instead, (actor: Actor, thing: Thing, supporter: Supported) => { ... })
  .on(TAKE.after, (actor: Actor, thing: Thing, supporter: Supported) => { ... });

new Supporter('supporter')
  .on(TAKE.before, (actor: Actor, thing: Thing, supporter: Supported) => { ... })
  .on(TAKE.instead, (actor: Actor, thing: Thing, supporter: Supported) => { ... })
  .on(TAKE.after, (actor: Actor, thing: Thing, supporter: Supported) => { ... });
```

### Actions/Rules

```ts
const take = new Verb("take", /take|get/);

// Just a rule:
rules.add(
  given: () => true, // optional
  when: () => [Thing],
  then: (actor: Actor, thing: Thing) => {
    if (thing.has(fixed)) {
      thing.add(portable);
    }
  },
  final: false,
  priority: Infinity,
);

// Object
rules.add({
  given: (actor: Actor) => actor.container !== room,
  when: (actor: Actor) => syntax`${examine} ${Thing.seenBy(actor)}`,
  then: (actor: Actor, _: Verb, thing: Thing) => {
    if (actor.has(thing)) return `You're already carrying ${thing}`;
    // etc
  },
  priority: 10,
  final: false
});

// Wrapped object
rules.add(
  (actor) => ({
    given: actor.container !== room,
    when: syntax`${examine} ${Thing.seenBy(actor)}`,
    then: (_: Verb, thing: Thing) => {
      if (actor.has(thing)) return `You're already carrying ${thing}`;
      // etc
    },
    priority: 10,
    final: false
  })
);

// also rxjs like without closure
rules.add(
  given((actor) => actor.container !== room)),
    and((actor) => actor.something.else)),
  when((actor) => syntax`${examine} ${Thing.seenBy(actor)}`),
  then((actor_: Verb, thing: Thing) => {
    if (actor.has(thing)) return `You already have it.`;
    // etc
  })
);

// funky!!
actionSystem
  .when`${examine} ${Thing}`
  .then((actor: Actor, _: Verb, thing: Thing) => {
    if (actor.has(thing)) return `You already have it.`;
    // etc
  });
```
