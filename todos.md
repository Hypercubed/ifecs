# Near term

- verbosity toggle
- Docs
  - Quick-start
- Naming conventions
  - tags vs things vs components?
  - queries (`Thing.accessibleBy(player)` vs `player.accessible(thing)`)
- Finalize Component/Tag system?
- System phases? Action phases?
  - System before/after (Topological sorting?)
- Injectable Services
  - nlp
  - prng
- Defining providers
  - `{ provide: OutputSystem, useClass: TestOutputSystem }`
  - `{ provide: GravitySystem, useValue: new GravitySystem(10) }`
  - `{ provide: SomeService, useFactory: () => { ... } }`
- Naming Decorators vs Classes
  - `@ModuleDecorator class A extends Module {}`
- Error handling
  - Unique entity names?
  - Component names?
- query builder?
- Systems (Rules/Triggers) DSL / Events
  - rules system to use queries?
  - trigger actions on entities when some conditions are met?
  - enterable/onExit events

# Std Lib

- locks and keys
- obvious exits
- Inventory max in std lib
- on enter/exit

# Longer term

- Recently used pronoun (it)?
- Serialization of game state
  - real save/restore?
- IFI Messaging?
- https://vorple-if.com/ ?
- Rule/Action priority (by specificity?)
- articles, prepositions, pronouns
  - `the(apple)` -> "The apple"
  - `a(thing)` -> "An apple"

# Optimizations

- Optimized queries with predicate?
- Query caching?
- Query sorting?
- Object pools?
