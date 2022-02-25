import type { GameObject } from '../GameObject'
import PriorityQueue from '../PriorityQueue'
import { deleteElem } from '../util'

export const renderedConnectionDistance = 30

export function connectZones(
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

export function positionZone(source: GameObject, target: GameObject) {
  if (!source.position) {
    source.position = {x: 0, y: 0}
  }

  if (!target.position) {
    target.position = {x: 0, y: 0}
  }

  const theta = 2 * Math.PI * Math.random()
  const d = renderedConnectionDistance
  const dx = d * Math.cos(theta)
  const dy = d * Math.sin(theta)
  target.position.x = source.position.x + dx
  target.position.y = source.position.y + dy
}

export function disconnectZones(source: GameObject, target: GameObject) {
  deleteElem(source.connections, target)
  deleteElem(target.connections, source)
}

export function removeConnections(a: GameObject) {
  if (a.connections) {
    for (const b of a.connections) {
      deleteElem(b.connections, a)
    }
    a.connections.length = 0
  }
}

export function connectionDistance(a: GameObject, b: GameObject) {
  // const dx = a.position.x - b.position.x
  // const dy = a.position.y - b.position.y
  // return Math.sqrt(dx * dx + dy * dy)
  return 1
}

interface Edge {
  source: GameObject,
  target: GameObject
}

export interface ZoneGraph {
  nodes: GameObject[],
  edges: Edge[],
}

export function getZoneGraph(startingNode: GameObject): ZoneGraph {
  const nodes = new Set<GameObject>()

  const edges: Edge[] = []

  function addNode(node: GameObject) {
    nodes.add(node)
    for (const connection of node.connections) {
      if (!nodes.has(connection)) {
        addNode(connection)
      }
    }
  }

  addNode(startingNode)

  const visited = new Set<GameObject>()

  for (const node of nodes) {

    for (const connection of node.connections) {
      if (!visited.has(connection)) {
        edges.push({
          source: node,
          target: connection,
        })
      }
    }

    visited.add(node)
  }

  return {
    nodes: [...nodes],
    edges,
  }
}

// A* search
export function getPath(source: GameObject, destination: GameObject) {
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

function reconstructPath(
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