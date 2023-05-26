import Node from './Node'

export default function findConnectedGraphs (nodes: Node[]) {
  const visited = new Map<Node, number>()
  const graphs: { nodes: Node[], edges: [Node, Node][] }[] = []

  let nextGraphId = 0

  for (const node of nodes) {
    if (visited.has(node)) {
      continue
    }
    graphs.push({ nodes: [], edges: [] })
    traverse(node, nextGraphId++)
  }

  function traverse (node: Node, graphId: number) {
    visited.set(node, graphId)
    graphs[graphId].nodes.push(node)

    // First loop adds edges without recursing
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        graphs[graphId].edges.push([node, edge])
      }
    }

    // Now we recurse in second loop to ensure no edges are skipped
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        traverse(edge, graphId)
      }
    }
  }

  return graphs
}
