import Point from '../Point'

export default class Node {
  position: Point
  edges: Node[] = []

  constructor (x = Math.random(), y = Math.random()) {
    this.position = new Point(x, y)
  }

  connect (other: Node) {
    this.edges.push(other)
    other.edges.push(this)
  }
}