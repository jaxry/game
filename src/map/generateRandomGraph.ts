import Node from './Node'
import findLargestGraph from './findLargestGraph'
import { makeArray } from '../util'

export function generateRandomGraph (nodeCount: number) {
  const chance = 1.5 / nodeCount

  const nodes = makeArray(nodeCount, () => new Node())

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < chance) {
        nodes[i].connect(nodes[j])
      }
    }
  }

  return findLargestGraph(nodes)
}

