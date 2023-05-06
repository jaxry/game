import Vertex from './Vertex'

export function getEdges (startingVertex: Vertex) {
  const visited = new Set<Vertex>()
  const edges: [Vertex, Vertex][] = []

  function traverse (vertex: Vertex) {
    visited.add(vertex)

    // First loop adds edges without recursing.
    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        edges.push([vertex, edge])
      }
    }

    // Now we recurse.
    // Doing it in a second loop ensures no edges are skipped.
    for (const edge of vertex.edges) {
      if (!visited.has(edge)) {
        traverse(edge)
      }
    }
  }

  traverse(startingVertex)

  return edges
}