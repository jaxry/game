import Node from './Node'

export function getEdges (startingNode: Node) {
  const visited = new Set<Node>()
  const edges: [Node, Node][] = []

  function traverse (node: Node) {
    visited.add(node)

    // First loop adds edges without recursing.
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        edges.push([node, edge])
      }
    }

    // Now we recurse.
    // Doing it in a second loop ensures no edges are skipped.
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        traverse(edge)
      }
    }
  }

  traverse(startingNode)

  return edges
}