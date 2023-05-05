import Vertex from './Vertex'
import findLargestGraph from './findLargestGraph'
import makeZones from './makeZones'
import { getEdges } from './getEdges'

export function generateRandomGraph (vertexCount: number) {
  const chance = 2 / vertexCount

  let vertices: Vertex[] = []
  for (let i = 0; i < vertexCount; i++) {
    vertices.push(new Vertex())
  }

  for (let i = 0; i < vertexCount; i++) {
    for (let j = i + 1; j < vertexCount; j++) {
      if (Math.random() < chance) {
        vertices[i].connect(vertices[j])
      }
    }
  }

  const connectedVertices = findLargestGraph(vertices)
  const edges = getEdges(connectedVertices[0])

  return makeZones(connectedVertices, edges)
}

