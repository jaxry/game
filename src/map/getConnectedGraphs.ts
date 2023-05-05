import Vertex from './Vertex'

function getConnectedGraphs (vertices: Vertex[]) {
  const visited = new Map<Vertex, number>()
  const edges: [Vertex, Vertex][][] = []
  const connectedVertices: Vertex[][] = []

  let nextGraphId = 0
  for (const vertex of vertices) {
    if (visited.has(vertex)) continue
    edges.push([])
    connectedVertices.push([])
    traverse(vertex, nextGraphId++)
  }

  function traverse (vertex: Vertex, graphId: number) {
    visited.set(vertex, graphId)
    connectedVertices[graphId].push(vertex)

    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        edges[graphId].push([vertex, edge])
      }
    }
    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        traverse(edge, graphId)
      }
    }
  }
}
