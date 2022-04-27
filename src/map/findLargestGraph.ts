import { Vertex } from './types'

export default function findLargestGraph(vertices: Vertex[]) {
  const visited = new Map<Vertex, number>()

  let nextGraphNum = 0
  for (const vertex of vertices) {
    if (visited.has(vertex)) continue
    traverse(vertex, nextGraphNum++)
  }

  function traverse(vertex: Vertex, graphNum: number) {
    if (visited.has(vertex)) return

    visited.set(vertex, graphNum)

    for (const edge of vertex.edges) {
      traverse(edge, graphNum)
    }
  }

  function getLargestGraphNum() {
    const graphSizes: number[] = []
    for (let i = 0; i < nextGraphNum; i++) {
      graphSizes[i] = 0
    }

    for (const graphNum of visited.values()) {
      graphSizes[graphNum]++
    }

    let largestGraphNum = 0
    for (let i = 0; i < graphSizes.length; i++) {
      if (graphSizes[i] > graphSizes[largestGraphNum]) {
        largestGraphNum = i
      }
    }
    return largestGraphNum
  }

  const maxGraphNum = getLargestGraphNum()
  const newVertices: Vertex[] = []
  for (const [vertex, graphNum] of visited) {
    if (graphNum === maxGraphNum) {
      newVertices.push(vertex)
    }
  }

  return newVertices
}