import Node from './Node'
import findLargestGraph from './findLargestGraph'

export function generateRandomGraph (nodeCount: number) {
  const chance = 2 / nodeCount

  let nodes: Node[] = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node())
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < chance) {
        nodes[i].connect(nodes[j])
      }
    }
  }

  return findLargestGraph(nodes)
}

