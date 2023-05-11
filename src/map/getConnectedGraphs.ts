import Node from './Node'

export default function getConnectedGraphs (nodes: Node[]) {
  const visited = new Map<Node, number>()
  const edges: [Node, Node][][] = []
  const connectedVertices: Node[][] = []

  let nextGraphId = 0
  for (const node of nodes) {
    if (visited.has(node)) continue
    edges.push([])
    connectedVertices.push([])
    traverse(node, nextGraphId++)
  }

  function traverse (node: Node, graphId: number) {
    visited.set(node, graphId)
    connectedVertices[graphId].push(node)

    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        edges[graphId].push([node, edge])
      }
    }
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        traverse(edge, graphId)
      }
    }
  }

  return { nodes, edges }
}
