import Vertex from './Vertex'
import findLargestGraph from './findLargestGraph'
import makeZones from './makeZones'

export function generateRandomGraph (vertexCount: number) {
  const chance = 2 / vertexCount

  function tryOnce () {
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

    return findLargestGraph(vertices)
  }

  let largest: Vertex[] = []
  for (let i = 0; i < 10; i++) {
    const vertices = tryOnce()
    if (vertices.length >= 0.5 * vertexCount) {
      return makeZones(vertices)
    } else if (vertices.length > largest.length) {
      largest = vertices
    }
  }
  console.warn(`Graph generation couldn't reach desired size`)
  return makeZones(largest)
}

