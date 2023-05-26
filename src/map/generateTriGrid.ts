import Node from './Node'
import { makeArray } from '../util'

const triHeight = Math.sqrt(3) / 2

export default function generateTriGrid (rows: number) {
  const columns = rows
  const size = rows * columns
  const nodes: Node[] = makeArray(size, () => new Node())

  function connect (a: Node, b: Node) {
    if (Math.random() < 0.5) {
      a.connect(b)
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const zone = nodes[i]
    const row = Math.floor(i / rows)
    const column = i % rows

    if (column > 0) {
      connect(zone, nodes[i - 1])
    }
    if (row > 0) {
      connect(zone, nodes[i - rows])
    }
    if (row > 0 && column < rows - 1) {
      connect(zone, nodes[i - rows + 1])
    }

    zone.position.x = column + 0.5 * row
    zone.position.y = row * triHeight
  }

  return nodes
}
