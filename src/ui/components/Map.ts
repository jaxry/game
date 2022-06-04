import Component from './Component'
import { game } from '../../Game'
import createSvg from '../createSvg'
import {
  getZoneGraph,
  renderedConnectionDistance,
  ZoneGraph,
} from '../../behavior/connections'
import { GameObject } from '../../GameObject'
import style from './Map.module.css'
import * as d3 from 'd3-force'
import { lerp, mapIter } from '../../util'
import animationDuration from '../animationDuration'

export default class MapComponent extends Component {
  onZoneClick?: (zone: GameObject) => void

  private svg = createSvg('svg')
  private mapG = createSvg('g')
  private edgeG = createSvg('g')
  private nodeG = createSvg('g')

  private transform = new DOMMatrix()

  private nodeToElem: Map<GameObject, Element> = new Map()
  private edgeToElem: Map<string, Element> = new Map()

  constructor() {
    super()

    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', '100%')
    this.element.append(this.svg)

    this.mapG.classList.add(style.map)
    this.mapG.append(
        this.edgeG,
        this.nodeG)
    this.svg.append(this.mapG)

    // const panZoom = new PanZoom(this.element, this.transform, () => {
    //   // this.mapG.setAttribute('transform', this.transform.toString())
    //   this.mapG.animate({
    //     transform: this.transform.toString(),
    //   }, {duration: 0, fill: 'forwards'})
    // })

    // temporary place to put this
    // force simulation should be run outside of MapComponent
    // usually when the map has zones added or removed by the game
    const graph = getZoneGraph(game.player.container)
    const nodes = [...graph.nodes]
    const d3Graph = makeD3Graph(graph)
    const sim = d3.forceSimulation()
    sim.nodes(d3Graph.nodes).
        force('charge',
            d3.forceManyBody().
                distanceMax(5 * renderedConnectionDistance).
                strength(node => {
                  return -30 * nodes[node.index!].connections.length
                })).
        force('link',
            d3.forceLink(d3Graph.edges).distance(renderedConnectionDistance)).
        velocityDecay(0.2).
        // alphaDecay(0.0075).
        tick(300).
        on('end', () => {
          console.log('done')
          this.update(game.player.container)
        })
  }

  nodeSize = (node: GameObject) => lerp(1, 6, 5, 20, node.connections.length)

  update(centerZone: GameObject) {
    const graph = getZoneGraph(centerZone, 2)

    this.setBounds(graph)

    for (const [obj, elem] of this.nodeToElem) {
      if (!graph.nodes.has(obj)) {
        transitionOut(elem)
        this.nodeToElem.delete(obj)
      }
    }
    for (const [hash, elem] of this.edgeToElem) {
      if (!graph.edges.has(hash)) {
        transitionOut(elem)
        this.edgeToElem.delete(hash)
      }
    }

    for (const node of graph.nodes) {
      if (this.nodeToElem.has(node)) {
        continue
      }

      const circle = createSvg('circle')
      circle.classList.add(style.node)
      circle.setAttribute('cx', node.position.x.toFixed(0))
      circle.setAttribute('cy', node.position.y.toFixed(0))
      circle.setAttribute('r', this.nodeSize(node).toFixed(0))
      circle.onclick = () => this.onZoneClick?.(node)
      this.nodeG.append(circle)
      transitionIn(circle)

      this.nodeToElem.set(node, circle)
    }

    for (const circle of this.nodeToElem.values()) {
      circle.classList.remove(style.center, style.canTravel)
    }
    this.nodeToElem.get(centerZone)!.classList.add(style.center)
    for (const zone of centerZone.connections) {
      this.nodeToElem.get(zone)!.classList.add(style.canTravel)
    }

    for (const [hash, edge] of graph.edges) {
      if (this.edgeToElem.has(hash)) {
        continue
      }

      const line = createSvg('line')
      line.classList.add(style.edge)
      line.setAttribute('x1', edge.source.position.x.toFixed(0))
      line.setAttribute('y1', edge.source.position.y.toFixed(0))
      line.setAttribute('x2', edge.target.position.x.toFixed(0))
      line.setAttribute('y2', edge.target.position.y.toFixed(0))
      this.edgeG.append(line)
      transitionIn(line)

      this.edgeToElem.set(hash, line)
    }
  }

  private setBounds(graph: ZoneGraph) {
    const bounds = getGraphBounds(graph)

    const scale = Math.min(this.element.offsetWidth / bounds.width,
        this.element.offsetHeight / bounds.height)

    this.transform.a = scale
    this.transform.d = scale
    this.transform.e = -bounds.xMin * scale
    this.transform.f = -bounds.yMin * scale

    // this.mapG.classList.add(style.transitionTransform)
    // this.mapG.addEventListener('transitionend', () => {
    //   this.mapG.classList.remove(style.transitionTransform)
    // }, {once: true})
    // this.mapG.setAttribute('transform', this.transform.toString())
    this.mapG.animate({
      transform: this.transform.toString(),
    }, {
      duration: animationDuration.slow,
      fill: 'forwards',
      easing: 'ease-in-out',
    }).commitStyles()
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

function makeD3Graph(graph: ZoneGraph) {
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

function transitionIn(elem: Element) {
  elem.animate({
    transform: ['scale(0)', 'scale(1)'],
  }, {
    duration: animationDuration.normal,
  })
}

function transitionOut(elem: Element) {
  elem.animate({
    transform: ['scale(1)', 'scale(0)'],
  }, {
    duration: animationDuration.normal,
  }).onfinish = () => {
    elem.remove()
  }
}
