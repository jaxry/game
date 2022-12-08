import {
  getZoneGraph, renderedConnectionDistance, ZoneGraph,
} from '../behavior/connections'
import { game } from '../Game'
import * as d3 from 'd3-force'
import { GameObject } from '../GameObject'
import { mapIter } from '../util'

export function startForceDirectedSimulation (startingNode: GameObject) {
  const graph = getZoneGraph(startingNode)
  const nodes = [...graph.nodes]
  const d3Graph = makeD3Graph(graph)
  const sim = d3.forceSimulation()
  sim.nodes(d3Graph.nodes)
      .force('charge', d3.forceManyBody()
          .distanceMax(5 * renderedConnectionDistance)
          .strength(node => {
            return -30 * nodes[node.index!].connections.length
          }))
      .force('link',
          d3.forceLink(d3Graph.edges).distance(renderedConnectionDistance))
      .velocityDecay(0.2)
      // .alphaDecay(0.0075)
      .tick(300)
      .on('end', () => {
        game.event.mapUpdated.emit(undefined)
      })
}

function makeD3Graph (graph: ZoneGraph) {
  const edges: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[] = []

  const nodes = mapIter(graph.nodes, n => n.position)

  for (const { source, target } of graph.edges.values()) {
    edges.push({
      source: source.position,
      target: target.position,
    })
  }

  return {
    nodes,
    edges,
  }
}
