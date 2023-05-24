import generateTriGrid from './generateTriGrid'
import { getEdges } from './getEdges'
import makeZones from './makeZones'

export default function createMap (rows: number) {
  const nodes = generateTriGrid(rows)
  const edges = getEdges(nodes[0])
  return makeZones(nodes, edges)
}
