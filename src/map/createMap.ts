import generateTriGrid from './generateTriGrid'
import makeZones from './makeZones'
import findConnectedGraphs from './findConnectedGraphs'
import { sortDescending } from '../util'

export default function createMap (rows: number) {
  const nodes = generateTriGrid(rows)
  const connectedGraphs = findConnectedGraphs(nodes)

  sortDescending(connectedGraphs, (graph) => graph.nodes.length)

  return makeZones(connectedGraphs[0].nodes, connectedGraphs[0].edges)
}
