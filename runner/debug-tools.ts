import { bold, cyan, italic, red } from "../deps.ts";
import { Entity } from "../ecs/mod.ts";
import { Location } from "../lib/entities/locations.ts";
import { Thing } from "../lib/entities/things.ts";
import { Token } from "../lib/entities/tokens.ts";
import {
  Graph,
  GraphEdges,
  GraphNode,
  graphTopoSort,
} from "../utils/topo-sort.ts";

export function printMap(location: Location) {
  const seen = new WeakSet();
  _map(location);

  function _map(location: Location, depth = " ") {
    const exits = location.exits;
    exits.forEach(([direction, location], i) => {
      const wasSeen = seen.has(location);
      const hasSibilings = i < exits.length - 1;
      // @ts-ignore location.exits
      const hasChildren = !wasSeen && location.exits.length > 0;

      let node = depth;
      node += hasSibilings ? "├" : "└";
      node += hasChildren ? "┬" : "─";

      console.log(
        node,
        `(${direction.name})`,
        getItemDescription(location),
        wasSeen ? italic(`(cycle)`) : "",
      );

      if (wasSeen) return;
      seen.add(location);

      const n = hasSibilings ? "│" : ` `;
      // @ts-ignore location.exits
      _map(location, depth + n);
    });
  }
}

export function printClasses(entities: readonly Entity[]) {
  const constructors = entities.map((e) => e.constructor);
  new Set(constructors).forEach((c) => {
    const S = classesToGraph([c]);
    printGraphTree(S, (e) => e.name);
  });
}

export function printTree(entities: readonly Entity[]) {
  const S: Graph = entitiesToGraph(entities);
  const L = graphTopoSort(S);
  printGraphTree(L, getItemDescription);
}

// deno-lint-ignore no-explicit-any
export function printGraphTree(graph: Graph, stringify: (a: any) => string) {
  const seen = new WeakSet();

  _tree(Array.from(graph.keys()), " ");

  function _tree(edges: GraphNode[], depth: string) {
    edges.forEach((t, i) => {
      if (seen.has(t)) return;
      seen.add(t);

      const siblings = edges.filter((s, j) => j > i && !seen.has(s));
      const children = Array.from(graph.get(t) || []).filter((c) =>
        !seen.has(c)
      );

      let s = depth;
      s += siblings.length ? "├" : "└";
      s += children.length ? "┬" : "─";

      const ss = stringify(t);
      if (ss) {
        console.log(s, stringify(t));
      }

      if (children.length) {
        const n = siblings.length ? "│" : ` `;
        _tree(children, depth + n);
      }
    });
  }
}

export function classesToGraph(items: GraphNode[]) {
  const G: Graph = new Map();
  items.forEach((e) => {
    walk(e);
  });
  return G;

  function walk(node: GraphNode) {
    if (node && "name" in node) {
      const parent = Object.getPrototypeOf(node);
      if (parent && parent.name) {
        G.set(node, new Set([parent]));
        walk(parent);
      } else {
        G.set(node, new Set());
      }
    }
  }
}

export function entitiesToGraph(items: readonly GraphNode[]) {
  const graph: Graph = new Map();
  items.forEach((e) => {
    const edges: GraphEdges = new Set(e.contents || []);
    graph.set(e, edges);
  });
  return graph;
}

export function getItemDescription(t: Entity) {
  const c = cyan(`[${t.constructor.name}]`);
  if (t instanceof Thing || t instanceof Token) {
    return `${bold(t.name)} ${red(String(t.match))} ${c}`;
  }
  return c;
}

// function mapToGraph(locations: readonly Location[]) {
//   const seen = new WeakSet();

//   const graph: Graph = new Map();
//   locations.forEach((location) => {
//     seen.add(location);
//     const exits = location.exits.map(([_, l]) => l).filter(l => !seen.has(l));
//     graph.set(location, new Set(exits));
//   });
//   return graph;
// }
