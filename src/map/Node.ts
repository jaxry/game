import Point from '../Point'

export default class Node {
  position?: Point
  edges: Node[] = []

  connect (other: Node) {
    this.edges.push(other)
    other.edges.push(this)
  }
}