import Vertex from './Vertex'

export function getEdges (startingVertex: Vertex) {
  const visited = new Set<Vertex>()
  const edges: [Vertex, Vertex][] = []

  function traverse (vertex: Vertex) {
    visited.add(vertex)

    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        edges.push([vertex, edge])
      }
    }

    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        traverse(edge)
      }
    }
  }

  traverse(startingVertex)

  return edges
}