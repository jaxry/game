import Component from './Component'
import createSvg from '../createSvg'
import { Edge, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { duration, mapEdgeColor } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { makeOrGet, numToPixel, translate } from '../../util'
import { TravelAnimation } from '../game/TravelAnimation'

export default class MapComponent extends Component {
  private svg = createSvg('svg')
  private edgeG = createSvg('g')

  private map = document.createElement('div')
  private zoneContainer = document.createElement('div')
  private travelIcons = document.createElement('div')

  travelAnimation = new TravelAnimation(this.travelIcons)

  private transform = {
    x: 0,
    y: 0,
    scale: 4,
  }

  private zoneToComponent = new Map<GameObject, MapNode>()
  private edgeToElem = new Map<string, { line: Element, edge: Edge }>()

  private elementScaleThreshold = 5

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.svg.classList.add(svgStyle)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', '100%')
    this.element.append(this.svg)

    this.svg.append(this.edgeG)

    this.map.classList.add(mapStyle)
    this.element.append(this.map)

    this.map.append(this.zoneContainer)
    this.map.append(this.travelIcons)

    addPanZoom(this.element, this.transform, (updatedScale) => {
      updatedScale && this.updateZonePositionsAndScale()
      this.updateTransform(false)
    })
  }

  render (centerZone: GameObject) {
    const graph = getZoneGraph(centerZone)

    for (const [zone, component] of this.zoneToComponent) {
      if (!graph.nodes.has(zone)) {
        this.removeZone(zone, component)
      }
    }

    for (const [zone, depth] of graph.nodes) {
      const component = makeOrGet(this.zoneToComponent, zone, () => {
        return this.makeZone(zone)
      })
      // depth <= 1 ? component.setComplex() : component.setSimple()
      component.setSimple()
    }

    for (const [hash, { line }] of this.edgeToElem) {
      if (!graph.edges.has(hash)) {
        shrink(line).onfinish = () => {
          line.remove()
        }
        this.edgeToElem.delete(hash)
      }
    }

    for (const [hash, edge] of graph.edges) {
      makeOrGet(this.edgeToElem, hash, () => {
        return this.makeEdge(edge)
      })
    }

    this.centerOnZone(centerZone)
  }

  private makeZone (zone: GameObject) {
    const component = this.newComponent(MapNode, zone, this)
    this.zoneContainer.append(component.element)
    return component
  }

  private removeZone (zone: GameObject, component: MapNode) {
    shrink(component.element).onfinish = () => {
      component.remove()
    }
    this.zoneToComponent.delete(zone)
  }

  private makeEdge (edge: Edge) {
    const line = createSvg('line')
    line.classList.add(edgeStyle)

    this.updateEdgePosition(line, edge)

    this.edgeG.append(line)
    grow(line)

    return { line, edge }
  }

  private centerOnZone (zone: GameObject) {
    this.transform.x = -zone.position.x * this.transform.scale
        + this.element.offsetWidth / 2
    this.transform.y = -zone.position.y * this.transform.scale +
        +this.element.offsetHeight / 2

    this.updateZonePositionsAndScale()
    this.updateTransform()
  }

  private updateZonePositionsAndScale () {
    const nodeScale = Math.max(this.elementScaleThreshold, this.transform.scale)

    for (const [zone, component] of this.zoneToComponent) {
      const x = zone.position.x * nodeScale
      const y = zone.position.y * nodeScale
      component.element.style.transform = translate(x, y)
    }

    this.travelAnimation.updateScale(nodeScale)
  }

  private updateEdgePosition (line: Element, edge: Edge) {
    line.setAttribute('x1', numToPixel(edge.source.position.x))
    line.setAttribute('y1', numToPixel(edge.source.position.y))
    line.setAttribute('x2', numToPixel(edge.target.position.x))
    line.setAttribute('y2', numToPixel(edge.target.position.y))
  }

  updatePositions () {
    this.updateZonePositionsAndScale()
    for (const { line, edge } of this.edgeToElem.values()) {
      this.updateEdgePosition(line, edge)
    }
  }

  private updateTransform (animate = false) {
    const { x, y, scale } = this.transform

    const mapScale = Math.min(1, scale / this.elementScaleThreshold)

    const options: KeyframeAnimationOptions = {
      duration: animate ? duration.slow : 0,
      fill: 'forwards',
      easing: 'ease-in-out',
    }

    this.edgeG.animate({
      transform: `${translate(x, y)} scale(${scale})`,
    }, options).commitStyles()
    this.map.animate({
      transform: `${translate(x, y)} scale(${mapScale})`,
    }, options).commitStyles()
  }
}

function grow (elem: Element) {
  return elem.animate({
    transform: ['scale(0)', 'scale(1)'],
  }, {
    duration: duration.slow,
    easing: 'ease-out',
  })
}

function shrink (elem: Element) {
  return elem.animate({
    transform: ['scale(1)', 'scale(0)'],
  }, {
    duration: duration.slow,
    easing: 'ease-in',
    composite: 'add',
  })
}

const containerStyle = makeStyle({
  position: 'relative',
  overflow: `hidden`,
  contain: `strict`,
})

const mapStyle = makeStyle({
  position: `absolute`,
  inset: `0`,
  transformOrigin: `top left`,
})

const svgStyle = makeStyle({
  position: `absolute`,
  inset: `0`,
})

const edgeStyle = makeStyle({
  stroke: mapEdgeColor,
  strokeWidth: `2`,
  vectorEffect: `non-scaling-stroke`,

  // make SVG transform behave like HTML transform
  transformBox: `fill-box`,
  transformOrigin: `center`,
})
