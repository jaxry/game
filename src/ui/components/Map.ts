import Component from './Component'
import createSvg from '../createSvg'
import {
  Edge, getZoneGraph, renderedConnectionDistance, ZoneGraph,
} from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { backgroundColor, duration } from '../theme'
import MapNode from './MapNode'

export default class MapComponent extends Component {
  onZoneClick?: (zone: GameObject) => void

  private svg = createSvg('svg')
  private mapG = createSvg('g')
  private edgeG = createSvg('g')
  private nodeG = createSvg('g')

  private transform = new DOMMatrix()

  private zoneToComponent: Map<GameObject, MapNode> = new Map()
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
    const graph = getZoneGraph(centerZone, 2)

    this.setBounds(graph)

    for (const [obj, component] of this.zoneToComponent) {
      if (!graph.nodes.has(obj)) {
        // transitionOut(elem)
        component.remove()
        this.zoneToComponent.delete(obj)
      }
    }

    for (const node of graph.nodes) {
      if (!this.zoneToComponent.has(node)) {
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

    for (const node of this.zoneToComponent.values()) {
      node.center(false)
      node.neighbor(false)
    }
    this.zoneToComponent.get(centerZone)!.center(true)
    for (const zone of centerZone.connections) {
      this.zoneToComponent.get(zone)!.neighbor(true)
    }
  }

  private makeNodeElem (zone: GameObject) {
    const node = this.newComponent(MapNode, zone)
    this.nodeG.append(node.element)
    this.zoneToComponent.set(zone, node)
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

const mapStyle = makeStyle()

makeStyle(`.${mapStyle} *`, {
  transformBox: `fill-box`,
  transformOrigin: `center`,
})

const edgeStyle = makeStyle({
  stroke: backgroundColor['500'],
})
