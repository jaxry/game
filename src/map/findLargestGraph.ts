import { Vertex } from './types'

export default function findLargestGraph(vertices: Vertex[]) {
  const visited = new Map<Vertex, number>()

  let nextGraphId = 0
  for (const vertex of vertices) {
    if (visited.has(vertex)) continue
    traverse(vertex, nextGraphId++)
  }

  function traverse(vertex: Vertex, graphId: number) {
    if (visited.has(vertex)) return

    visited.set(vertex, graphId)

    for (const edge of vertex.edges) {
      traverse(edge, graphId)
    }
  }

  function getLargestGraph() {
    const graphSizes: number[] = []
    for (let i = 0; i < nextGraphId; i++) {
      graphSizes[i] = 0
    }

    for (const graphNum of visited.values()) {
      graphSizes[graphNum]++
    }

    let largestGraph = 0
    for (let i = 0; i < graphSizes.length; i++) {
      if (graphSizes[i] > graphSizes[largestGraph]) {
        largestGraph = i
      }
    }
    return largestGraph
  }

  const largestGraph = getLargestGraph()
  const newVertices: Vertex[] = []
  for (const [vertex, graphId] of visited) {
    if (graphId === largestGraph) {
      newVertices.push(vertex)
    }
  }

  return newVertices
}