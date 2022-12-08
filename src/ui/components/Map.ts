import Component from './Component'
import createSvg from '../createSvg'
import {
  Edge, getZoneGraph, renderedConnectionDistance, ZoneGraph,
} from '../../behavior/connections'
import { GameObject } from '../../GameObject'
import { lerp } from '../../util'
import { makeStyle } from '../makeStyle'
import { backgroundColor, duration, shadowFilter } from '../theme'
import colors from '../colors'

export default class MapComponent extends Component {
  onZoneClick?: (zone: GameObject) => void

  private svg = createSvg('svg')
  private mapG = createSvg('g')
  private edgeG = createSvg('g')
  private nodeG = createSvg('g')

  private transform = new DOMMatrix()

  private nodeToElem: Map<GameObject, Element> = new Map()
  private edgeToElem: Map<string, Element> = new Map()

  constructor () {
    super()

    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', '100%')
    this.element.append(this.svg)

    this.mapG.classList.add(mapStyle)
    this.mapG.append(
        this.edgeG,
        this.nodeG)

    this.svg.append(this.mapG)

    // addPanZoom(this.element, this.transform, () => {
    //   // this.mapG.setAttribute('transform', this.transform.toString())
    //   this.mapG.animate({
    //     transform: this.transform.toString(),
    //   }, { fill: 'forwards' })
    // })
  }

  setCenter (centerZone: GameObject) {
    const graph = getZoneGraph(centerZone)

    this.setBounds(graph)

    for (const [obj, elem] of this.nodeToElem) {
      if (!graph.nodes.has(obj)) {
        transitionOut(elem)
        this.nodeToElem.delete(obj)
      }
    }

    for (const node of graph.nodes) {
      if (!this.nodeToElem.has(node)) {
        this.makeNodeElem(node)
      }
    }

    for (const [hash, elem] of this.edgeToElem) {
      if (!graph.edges.has(hash)) {
        transitionOut(elem)
        this.edgeToElem.delete(hash)
      }
    }

    for (const [hash, edge] of graph.edges) {
      if (!this.edgeToElem.has(hash)) {
        this.makeEdgeElem(hash, edge)
      }
    }

    for (const circle of this.nodeToElem.values()) {
      circle.classList.remove(playerNodeStyle, canTravelStyle)
    }

    this.nodeToElem.get(centerZone)!.classList.add(playerNodeStyle)

    for (const zone of centerZone.connections) {
      this.nodeToElem.get(zone)!.classList.add(canTravelStyle)
    }
  }

  private makeNodeElem (node: GameObject) {
    const circle = createSvg('circle')
    circle.classList.add(nodeStyle)
    circle.setAttribute('cx', node.position.x.toFixed(0))
    circle.setAttribute('cy', node.position.y.toFixed(0))
    circle.setAttribute('r', nodeSize(node).toFixed(0))
    circle.onclick = () => this.onZoneClick?.(node)

    this.nodeG.append(circle)
    transitionIn(circle)
    this.nodeToElem.set(node, circle)
  }

  private makeEdgeElem (hash: string, edge: Edge) {
    const line = createSvg('line')
    line.classList.add(edgeStyle)
    line.setAttribute('x1', edge.source.position.x.toFixed(0))
    line.setAttribute('y1', edge.source.position.y.toFixed(0))
    line.setAttribute('x2', edge.target.position.x.toFixed(0))
    line.setAttribute('y2', edge.target.position.y.toFixed(0))

    this.edgeG.append(line)
    transitionIn(line)
    this.edgeToElem.set(hash, line)
  }

  private setBounds (graph: ZoneGraph) {
    const bounds = getGraphBounds(graph)

    const { width, height } = this.element.getBoundingClientRect()

    const scale = Math.min(width / bounds.width, height / bounds.height)

    this.transform.a = scale
    this.transform.d = scale
    this.transform.e = -bounds.xMin * scale
    this.transform.f = -bounds.yMin * scale

    this.mapG.animate({
      transform: this.transform.toString(),
    }, {
      duration: duration.slow,
      fill: 'forwards',
      easing: 'ease-in-out',
    }).commitStyles()
  }
}

function getGraphBounds (graph: ZoneGraph) {
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

function transitionIn (elem: Element) {
  elem.animate({
    transform: ['scale(0)', 'scale(1)'],
  }, {
    duration: duration.normal,
  })
}

function transitionOut (elem: Element) {
  elem.animate({
    transform: ['scale(1)', 'scale(0)'],
  }, {
    duration: duration.normal,
  }).onfinish = () => {
    elem.remove()
  }
}

function nodeSize (node: GameObject) {
  return lerp(1, 6, 5, 20, node.connections.length)
}

const mapStyle = makeStyle()

makeStyle(`.${mapStyle} *`, {
  transformBox: `fill-box`,
  transformOrigin: `center`,
})

const nodeStyle = makeStyle({
  fill: colors.slate['700'],
  filter: shadowFilter,
  cursor: `pointer`,
  transition: `all ${duration.fast}ms`,
})

const canTravelStyle = makeStyle({
  fill: colors.sky['500'],
})

const playerNodeStyle = makeStyle({
  fill: colors.green['400'],
  filter: `${shadowFilter} drop-shadow(0 0 0.25rem ${colors.green['400']})`,
})

const edgeStyle = makeStyle({
  stroke: backgroundColor['500'],
})
