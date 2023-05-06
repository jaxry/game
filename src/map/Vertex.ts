import Point from '../Point'

export default class Vertex {
  position?: Point
  edges: Vertex[] = []

  connect (other: Vertex) {
    this.edges.push(other)
    other.edges.push(this)
  }
}