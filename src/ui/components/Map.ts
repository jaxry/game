import Component from './Component'
import createSvg from '../createSvg'
import {
  Edge, getZoneGraph, renderedConnectionDistance, ZoneGraph,
} from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { backgroundColor, duration } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { numToPixel, translate } from '../../util'
import { TravelAnimation } from '../gameFunctions/TravelAnimation'

export default class MapComponent extends Component {
  onZoneClick?: (zone: GameObject) => void

  private svg = createSvg('svg')
  private edgeG = createSvg('g')
  private map = document.createElement('div')

  private travelIcons = document.createElement('div')
  private nodeContainer = document.createElement('div')

  private travelAnimation = new TravelAnimation(this.travelIcons)

  private transform = {
    x: 0,
    y: 0,
    scale: 1,
  }

  private zoneToComponent: Map<GameObject, MapNode> = new Map()
  private edgeToElem: Map<string, { line: Element, edge: Edge }> = new Map()

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.svg.classList.add(svgStyle)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', '100%')
    this.element.append(this.svg)

    this.svg.append(this.edgeG)

    this.map.classList.add(mapStyle)
    this.map.append(this.travelIcons)
    this.map.append(this.nodeContainer)

    this.element.append(this.map)

    addPanZoom(this.element, this.transform, (updatedScale) => {
      updatedScale && this.updateScale()
      this.updateTranslation()
    })
  }

  setCenter (centerZone: GameObject) {
    const graph = getZoneGraph(centerZone)

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

    for (const [hash, { line }] of this.edgeToElem) {
      if (!graph.edges.has(hash)) {
        transitionOut(line)
        this.edgeToElem.delete(hash)
      }
    }

    for (const [hash, edge] of graph.edges) {
      if (!this.edgeToElem.has(hash)) {
        this.makeEdgeElem(hash, edge)
      }
    }

    // set node colors
    // for (const node of this.zoneToComponent.values()) {
    // node.center(false)
    //   node.neighbor(false)
    // }
    //
    // this.zoneToComponent.get(centerZone)!.center(true)
    //
    // for (const zone of centerZone.connections) {
    //   this.zoneToComponent.get(zone)!.neighbor(true)
    // }

    // make graph fit to screen
    this.setTransformToGraphBounds(graph)
  }

  private makeNodeElem (zone: GameObject) {
    const node = this.newComponent(MapNode, zone, this.travelAnimation)
    this.nodeContainer.append(node.element)
    this.zoneToComponent.set(zone, node)
  }

  private makeEdgeElem (hash: string, edge: Edge) {
    const line = createSvg('line')
    line.classList.add(edgeStyle)
    this.edgeG.append(line)
    transitionIn(line)
    this.edgeToElem.set(hash, { line, edge })
  }

  private setTransformToGraphBounds (graph: ZoneGraph) {
    const bounds = getGraphBounds(graph)

    const { width, height } = this.element.getBoundingClientRect()

    this.transform.x = -bounds.xMin * this.transform.scale
    this.transform.y = -bounds.yMin * this.transform.scale
    this.transform.scale =
        Math.min(width / bounds.width, height / bounds.height)
    this.updateScale()
    this.updateTranslation()
  }

  private updateScale () {
    for (const [zone, component] of this.zoneToComponent) {
      const x = zone.position.x * this.transform.scale
      const y = zone.position.y * this.transform.scale
      component.setPosition(x, y)
    }

    for (const { edge, line } of this.edgeToElem.values()) {
      const x1 = edge.source.position.x * this.transform.scale
      const y1 = edge.source.position.y * this.transform.scale
      const x2 = edge.target.position.x * this.transform.scale
      const y2 = edge.target.position.y * this.transform.scale
      line.setAttribute('x1', numToPixel(x1))
      line.setAttribute('y1', numToPixel(y1))
      line.setAttribute('x2', numToPixel(x2))
      line.setAttribute('y2', numToPixel(y2))
    }
  }

  private updateTranslation () {
    const transform = translate(this.transform.x, this.transform.y)
    this.edgeG.style.transform = transform
    this.map.style.transform = transform
    // this.mapG.animate({
    //   transform: `translate(${this.transform.x}px,${this.transform.y}px)`,
    // }, {
    //   duration: duration.slow,
    //   fill: 'forwards',
    //   easing: 'ease-in-out',
    // }).commitStyles()
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

const containerStyle = makeStyle({
  position: 'relative',
})

const mapStyle = makeStyle({
  position: `absolute`,
  inset: `0`,
})

const svgStyle = makeStyle()
makeStyle(`.${svgStyle} *`, {
  transformBox: `fill-box`,
  transformOrigin: `center`,
})

const edgeStyle = makeStyle({
  stroke: backgroundColor['500'],
  strokeWidth: `2`,
})
