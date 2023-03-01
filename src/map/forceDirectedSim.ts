import { getZoneGraph, ZoneGraph } from '../behavior/connections'
import * as d3 from 'd3-force'
import GameObject from '../GameObject'
import { mapIter } from '../util'
import SpatialGrid from '../physics/SpatialGrid'
import { game } from '../Game'

// gets the default d3 node distance
export const renderedConnectionDistance = 30

export function startForceDirectedSimulation (startingNode: GameObject) {
  // const graph = getZoneGraph(startingNode)
  // const nodes = [...graph.nodes.keys()]
  // const d3Graph = makeD3Graph(graph)
  // const sim = d3.forceSimulation()
  // sim.nodes(d3Graph.nodes)
  //     .force('charge', d3.forceManyBody()
  //         .distanceMax(5 * renderedConnectionDistance)
  //         .strength(node => {
  //           return -renderedConnectionDistance *
  //               nodes[node.index!].connections.length
  //         }))
  //     .force('link', d3.forceLink(d3Graph.edges))
  //     .velocityDecay(0.2)
  //     .on('tick', () => {
  //       game.event.mapUpdated.emit()
  //     })

  const graph = getZoneGraph(startingNode)
  const nodes = [...graph.nodes.keys()]
  const edges = [...graph.edges.values()]
  const grid = new SpatialGrid<GameObject>(10 * renderedConnectionDistance)

  let alpha = 1

  function tick () {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j]
        const dx = other.position.x - node.position.x
        const dy = other.position.y - node.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        let force = Math.min(10 / dist, 1000)
        const fx = force * force * dx / dist
        const fy = force * force * dy / dist
        node.position.vx -= fx
        node.position.vy -= fy
        other.position.vx += fx
        other.position.vy += fy
      }
    }

    // for (const node of nodes) {
    //   for (let dx = -1; dx <= 1; dx++) {
    //     for (let dy = -1; dy <= 1; dy++) {
    //       const otherNodes = grid.get(node.position.x, node.position.y, dx, dy)
    //       if (!otherNodes) continue
    //       for (const other of otherNodes) {
    //           if (other.id <= node.id) continue
    //           const dx = other.position.x - node.position.x
    //           const dy = other.position.y - node.position.y
    //           const dist = Math.sqrt(dx * dx + dy * dy)
    //           let force = Math.min(10 / dist, 1000)
    //           const fx = force * force * dx / dist
    //           const fy = force * force * dy / dist
    //           node.position.vx -= fx
    //           node.position.vy -= fy
    //           other.position.vx += fx
    //           other.position.vy += fy
    //       }
    //     }
    //   }
    // }

    for (const { source, target } of edges) {
      const dx = target.position.x - source.position.x
      const dy = target.position.y - source.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const force = 0.01 * (dist - renderedConnectionDistance)
      const fx = force * dx / dist
      const fy = force * dy / dist
      source.position.vx += fx
      source.position.vy += fy
      target.position.vx -= fx
      target.position.vy -= fy
    }

    alpha *= 0.9995
    // grid.clear()

    for (const node of nodes) {
      node.position.vx *= alpha
      node.position.vy *= alpha
      node.position.x += node.position.vx
      node.position.y += node.position.vy
      // grid.add(node.position.x, node.position.y, node)
    }

    game.event.mapUpdated.emit()

    requestAnimationFrame(tick)
  }

  tick()
  console.log(grid)
}

function makeD3Graph (graph: ZoneGraph) {
  const edges: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[] = []

  const nodes = mapIter(graph.nodes.keys(), n => n.position)

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