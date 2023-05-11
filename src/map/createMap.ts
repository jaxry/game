import generateTriGrid from './generateTriGrid'
import { getEdges } from './getEdges'
import makeZones from './makeZones'

export default function createMap (size: number) {
  const nodes = generateTriGrid(Math.sqrt(size))
  const edges = getEdges(nodes[0])
  return makeZones(nodes, edges)
}
