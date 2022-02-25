import type { ZoneGraph } from '../behavior/connections'
import {
  getZoneGraph,
  renderedConnectionDistance,
} from '../behavior/connections'
import type { GameObject } from '../GameObject'
import PanZoom from './PanZoom'
import * as d3 from 'd3-force'
import throttle from './throttle'

export default class MapRenderer {
  ctx: CanvasRenderingContext2D

  nodeSize = 10
  nodeColor = '#d8d8d8'

  edgeSize = 1
  edgeColor = '#999999'

  playerColor = '#94bdff'
  player?: GameObject
  private transform = new DOMMatrix()
  private graph!: ZoneGraph
  private sim = d3.forceSimulation()

  constructor(container: HTMLElement) {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    container.appendChild(canvas)

    maximizeCanvas(canvas)

    this.ctx = canvas.getContext('2d', {alpha: false})!

    new PanZoom(canvas, this.transform, () => this.draw())

    canvas.addEventListener('click', (e) => {
      const {x, y} = mouseToModel(canvas, this.transform, e.clientX, e.clientY)
      for (const node of this.graph.nodes) {
        const dx = (node.position.x - x)
        const dy = (node.position.y - y)
        const distance2 = dx * dx + dy * dy
        if (distance2 < this.nodeSize * this.nodeSize) {
          this.onZoneClicked(node)
          return
        }
      }
    })

    canvas.addEventListener('pointermove', throttle((e) => {
      const {x, y} = mouseToModel(canvas, this.transform, e.clientX, e.clientY)
      for (const node of this.graph.nodes) {
        const dx = (node.position.x - x)
        const dy = (node.position.y - y)
        const distance2 = dx * dx + dy * dy
        if (distance2 < this.nodeSize * this.nodeSize) {
          canvas.style.cursor = 'pointer'
          return
        }
      }
      canvas.style.cursor = ''
    }))
  }

  onZoneClicked = (zone: GameObject) => {}

  initMap(startingNode: GameObject) {
    this.graph = getZoneGraph(startingNode)

    const d3Graph = makeD3Graph(this.graph)

    console.time('graph renderer')
    this.sim.nodes(d3Graph.nodes).
        force('charge', d3.forceManyBody().distanceMax(700)).
        force('link',
            d3.forceLink(d3Graph.edges).distance(renderedConnectionDistance)).
        velocityDecay(0.2).
        alpha(1).
        restart().
        tick(50).
        on('tick', () => {
          this.draw()
        })
    console.timeEnd('graph renderer')

    const bounds = getGraphBounds(this.graph)

    const scale = Math.min(this.ctx.canvas.width / bounds.width,
        this.ctx.canvas.height / bounds.height)
    this.transform.a = scale
    this.transform.d = scale
    this.transform.e = -bounds.xMin * scale
    this.transform.f = -bounds.yMin * scale
  }

  update() {
    maximizeCanvas(this.ctx.canvas)
    this.draw()
  }

  draw() {
    const ctx = this.ctx

    ctx.resetTransform()
    ctx.fillStyle = '#282828'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.setTransform(this.transform)

    // // draw edges
    ctx.lineWidth = this.edgeSize
    ctx.strokeStyle = this.edgeColor
    ctx.beginPath()
    for (const {source, target} of this.graph.edges) {
      ctx.moveTo(source.position.x, source.position.y)
      ctx.lineTo(target.position.x, target.position.y)
    }
    ctx.stroke()

    // draw nodes
    ctx.fillStyle = this.nodeColor
    ctx.beginPath()
    for (const node of this.graph.nodes) {
      const {x, y} = node.position
      ctx.moveTo(x, y)
      ctx.arc(x, y, this.nodeSize, 0, 2 * Math.PI)
    }
    ctx.fill()

    // draw player node
    if (this.player) {
      const playerPosition = this.player.container.position
      ctx.fillStyle = this.playerColor
      ctx.shadowColor = this.playerColor
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(playerPosition.x, playerPosition.y,
          this.nodeSize,
          0, 2 * Math.PI)
      ctx.fill()
      ctx.shadowColor = ''
      ctx.shadowBlur = 0
    }
  }
}

function maximizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = canvas.parentElement!.offsetWidth * window.devicePixelRatio
  canvas.height = canvas.parentElement!.offsetHeight * window.devicePixelRatio
}

function mouseToModel(
    canvas: HTMLCanvasElement, transform: DOMMatrix, clientX: number,
    clientY: number) {
  const {top, left} = canvas.getBoundingClientRect()
  const mx = (clientX - left) * window.devicePixelRatio
  const my = (clientY - top) * window.devicePixelRatio
  const x = (mx - transform.e) / transform.a
  const y = (my - transform.f) / transform.d
  return {x, y}
}

function makeD3Graph(graph: ZoneGraph) {
  const edges: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[] = []

  const nodes = graph.nodes.map(n => n.position)

  for (const {source, target} of graph.edges) {
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

function getGraphBounds(graph: ZoneGraph) {
  const bounds = {
    xMin: Infinity,
    xMax: -Infinity,
    yMin: Infinity,
    yMax: -Infinity,
    width: Infinity,
    height: Infinity,
  }

  for (const node of graph.nodes) {
    bounds.xMin = Math.min(bounds.xMin, node.position.x)
    bounds.xMax = Math.max(bounds.xMax, node.position.x)
    bounds.yMin = Math.min(bounds.yMin, node.position.y)
    bounds.yMax = Math.max(bounds.yMax, node.position.y)
  }

  bounds.xMin -= renderedConnectionDistance
  bounds.xMax += renderedConnectionDistance
  bounds.yMin -= renderedConnectionDistance
  bounds.yMax += renderedConnectionDistance
  bounds.width = bounds.xMax - bounds.xMin
  bounds.height = bounds.yMax - bounds.yMin

  return bounds
}