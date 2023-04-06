import type GameObject from '../GameObject'
import PriorityQueue from '../PriorityQueue'
import { deleteElem } from '../util'
import { renderedConnectionDistance } from '../map/forceDirectedSim'

export function connectZones (
    source: GameObject, target: GameObject, autoPosition = true) {
  if (!source.connections) {
    source.connections = []
  }

  if (!target.connections) {
    target.connections = []
  }

  if (autoPosition) {
    positionZone(source, target)
  }

  source.connections.push(target)
  target.connections.push(source)
}

function positionZone (source: GameObject, target: GameObject) {
  const theta = 2 * Math.PI * Math.random()
  const d = 2 * renderedConnectionDistance
  const dx = d * Math.cos(theta)
  const dy = d * Math.sin(theta)
  target.position.x = source.position.x + dx
  target.position.y = source.position.y + dy
}

export function disconnectZones (source: GameObject, target: GameObject) {
  deleteElem(source.connections, target)
  deleteElem(target.connections, source)
}

export function removeConnections (a: GameObject) {
  if (a.connections) {
    for (const b of a.connections) {
      deleteElem(b.connections, a)
    }
    a.connections.length = 0
  }
}

export function connectionDistance (a: GameObject, b: GameObject) {
  // const dx = a.position.x - b.position.x
  // const dy = a.position.y - b.position.y
  // return Math.sqrt(dx * dx + dy * dy)
  return 1
}

export interface Edge {
  source: GameObject
  target: GameObject
}

export interface ZoneGraph {
  nodes: Map<GameObject, number>
  edges: Map<string, Edge>
}

export function getZoneGraph (
    startingNode: GameObject, maxDepth = Infinity): ZoneGraph {
  const nodes = new Map<GameObject, number>()
  const edges = new Map<string, Edge>()

  function traverse (node: GameObject, depth: number) {
    if (nodes.has(node)) {
      nodes.set(node, Math.min(nodes.get(node)!, depth))
      return
    }

    nodes.set(node, depth)

    if (depth < maxDepth) {
      for (const neighbor of node.connections) {
        traverse(neighbor, depth + 1)
      }
    }
  }

  traverse(startingNode, 0)

  const visited = new Set<GameObject>()
  for (const node of nodes.keys()) {
    visited.add(node)
    for (const neighbor of node.connections) {
      if (!nodes.has(neighbor) || visited.has(neighbor)) {
        continue
      }
      const edge = { source: node, target: neighbor }
      edges.set(edgeHash(edge), edge)
    }
  }

  return {
    nodes,
    edges,
  }
}

function edgeHash ({ source, target }: Edge) {
  if (source.id < target.id) {
    return `${source.id}-${target.id}`
  } else {
    return `${target.id}-${source.id}`
  }
}

// A* search
export function getPath (source: GameObject, destination: GameObject) {
  const cameFrom = new Map<GameObject, GameObject>()
  const costSoFar = new Map<GameObject, number>()
  const frontier = new PriorityQueue<GameObject>()

  frontier.set(source, 0)
  cameFrom.set(source, source)
  costSoFar.set(source, 0)

  while (frontier.length) {
    const current = frontier.get()

    if (current === destination) {
      return reconstructPath(source, destination, cameFrom)
    }

    const currentCost = costSoFar.get(current)!

    for (const next of current.connections) {
      const newCost = currentCost + connectionDistance(current, next)
      const neighborCost = costSoFar.get(next)

      if (neighborCost === undefined || newCost < neighborCost) {
        // const heuristic = connectionDistance(next, destination)
        const heuristic = 0
        frontier.set(next, newCost + heuristic)
        costSoFar.set(next, newCost)
        cameFrom.set(next, current)
      }
    }
  }
}

function reconstructPath (
    source: GameObject, destination: GameObject,
    cameFrom: Map<GameObject, GameObject>) {
  const path: GameObject[] = []
  let current = destination

  while (current !== source) {
    path.push(current)
    current = cameFrom.get(current)!
  }

  path.reverse()

  return path.reverse
}