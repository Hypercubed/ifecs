# IFECS

## Introduction

IFECS is a framework for building and playing interactive fiction (IF) games
using TypeScript (TS).

## Goals

The overall goal of IFECS is to focus on developer experience. Both the
development tools and game itself are written in the same language with a DSL
designed for IF games.

## Concepts

IFECS consists of two levels. At it's core IFECS has a small and easy-to-use
entity-component-system (ECS) engine. IFECS also includes a library of modules
that turn this agnostic ECS engine into a interface fiction game engine.

## Getting Started

_TBR_

### The ECS in IFECS

ECS is an pattern commonly used in game development. An ECS engine prefers
composition over inheritance to allow for greater flexibility when defining
entities. IFECS breaks the traditional ECS rules in several ways in order to
better enable the goal of improved developer experience.

**Engine** - The engine is the orchestrator of the game world. It handles the
organization of entities, systems and modules. It starts and stops the game.

**Entity** - An entity is an object within the game. In typical ECS frameworks
entities are amorphous object which contain no data and no logic and act simply
as a container of components. While this is mostly true for IFECS entities,
IFECS uses JavaScript classes as entity families. These entity families are used
as blueprints for creating entities, an archetypes for queries and as a facade
for easy interaction with components.

**Component** - A component is a piece of data attached to an entity. In IFECS
we allow some function to be used as components. In a more traditional ECS
system these functions would be encapsulated in systems. (TBD: data components,
tags, functions)

**System** - Systems are logic bricks. Systems run in a defined sequence each
turn to progress the story.

**Modules** - Modules are blocks (classes) that encapsulate entities,
components, and systems. Modules are loaded into the engine to provide the
engine some game capabilities. Every game will require at least one module. Each
module can specify other modules as required to build up the required behavior.
The IF portions of IFECS are encapsulated in various modules.

### The IF in IFECS

Various modules are provided to turn the generic ECS engine into a IF framework.

**if.module** - This is the core of the IF framework. It includes an action
system, rules system, and an output (rendering) system. The action system,
discussed in detail later, is used to define the game vocabulary.

### Creating a Game

_TBR_

## Acknowledgments

IFECS would not be possible without the inspiration following of the following :

- [Gamefic](https://github.com/castwide/gamefic)
- [Alan Interactive Fiction Language](https://www.alanif.se/)
- [Inform 7](http://inform7.com/)
- [Rule-Based Programming in Interactive
  Fiction](https://eblong.com/zarf/essays/rule-based-if/)
- [Tick-Knock](https://github.com/mayakwd/tick-knock)
- [Flecs](https://github.com/SanderMertens/flecs)

## License

This project is licensed under the MIT License - see the LICENSE file for
details
