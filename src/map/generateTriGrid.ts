import Node from './Node'
import Point from '../Point'
import findLargestGraph from './findLargestGraph'

const triHeight = Math.sqrt(3) / 2

export default function generateTriGrid (rows: number) {
  const nodes: Node[] = []

  function connect (a: Node, b: Node) {
    if (Math.random() < 0.5) {
      a.connect(b)
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {

      const z = new Node()
      if (c > 0) {
        connect(z, nodes.at(-1)!)
      }
      if (c > 0 && r > 0) {
        connect(z, nodes.at(-r - 1)!)
      }
      if (c < r && r > 0) {
        connect(z, nodes.at(-r)!)
      }

      z.position = new Point(-0.5 * r + c, r * triHeight)

      nodes.push(z)
    }
  }

  return findLargestGraph(nodes)
}
