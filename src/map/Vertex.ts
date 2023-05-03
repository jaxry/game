export default class Vertex {
  edges: Vertex[] = []

  connect (other: Vertex) {
    this.edges.push(other)
    other.edges.push(this)
  }
}