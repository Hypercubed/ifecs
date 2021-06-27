// deno-lint-ignore no-explicit-any
export type GraphNode = any;
export type GraphEdges = Set<GraphNode>;
export type Graph = Map<GraphNode, GraphEdges>;

function cloneGraph(S: Graph): Graph {
  const G = new Map<GraphNode, GraphEdges>(); // Clone for prosessing

  S.forEach((edges, node) => {
    G.set(node, new Set(edges));
  });

  return G;
}

export function topoSort(S: Graph): GraphNode[] {
  const L: GraphNode[] = []; // Topo sorted nodes
  const G = cloneGraph(S); // Clone for prosessing

  while (G.size) {
    const s = G.size;
    G.forEach((edges, node) => {
      if (edges.size === 0) {
        G.delete(node);
        L.push(node);
        G.forEach((e) => {
          e.delete(node);
        });
      }
    });
    if (s === G.size) {
      throw new Error("graph has at least one cycle");
    }
  }

  return L;
}

export function graphTopoSort(S: Graph): Graph {
  const L: GraphNode[] = topoSort(S).reverse(); // Topo sorted nodes
  const G: Graph = new Map<GraphNode, GraphEdges>(); // Sorted Graph

  L.forEach((node) => {
    const edges = Array.from(S.get(node)!)
      .sort((a, b) => L.indexOf(b) - L.indexOf(a));
    G.set(node, new Set(edges));
  });

  return G;
}
