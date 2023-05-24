import Node from './Node'
import { makeArray, mapIter } from '../util'

export default function findLargestGraph (nodes: Node[]) {
  const visited = new Map<Node, number>()

  let nextGraphId = 0
  for (const node of nodes) {
    if (visited.has(node)) continue
    traverse(node, nextGraphId++)
  }

  function traverse (node: Node, graphId: number) {
    visited.set(node, graphId)

    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        traverse(edge, graphId)
      }
    }
  }

  function getLargestGraphId () {
    const graphSizes = makeArray(nextGraphId, () => 0)

    for (const graphNum of visited.values()) {
      graphSizes[graphNum]++
    }

    return graphSizes.reduce((maxIndex, x, i) =>
        x > graphSizes[maxIndex] ? i : maxIndex, 0)
  }

  const largestGraphId = getLargestGraphId()

  return mapIter(visited, ([node, graphId]) => {
    return graphId === largestGraphId ? node : undefined
  })
}