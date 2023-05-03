import Vertex from './Vertex'
import { mapIter } from '../util'

export default function findLargestGraph (vertices: Vertex[]) {
  const visited = new Map<Vertex, number>()

  let nextGraphId = 0
  for (const vertex of vertices) {
    if (visited.has(vertex)) continue
    traverse(vertex, nextGraphId++)
  }

  function traverse (vertex: Vertex, graphId: number) {
    if (visited.has(vertex)) return

    visited.set(vertex, graphId)

    for (const edge of vertex.edges) {
      traverse(edge, graphId)
    }
  }

  function getLargestGraph () {
    const graphSizes = new Array(nextGraphId).fill(0)

    for (const graphNum of visited.values()) {
      graphSizes[graphNum]++
    }

    return graphSizes.reduce((maxIndex, x, i) =>
        x > graphSizes[maxIndex] ? i : maxIndex, 0)
  }

  const largestGraph = getLargestGraph()

  return mapIter(visited, ([vertex, graphId]) => {
    return graphId === largestGraph ? vertex : undefined
  })
}