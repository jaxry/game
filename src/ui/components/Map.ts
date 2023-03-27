import Component from './Component'
import createSvg from '../createSvg'
import { Edge, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { duration, mapEdgeColor } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { makeOrGet, numToPixel, translate } from '../../util'
import TravelAnimation from '../game/TravelAnimation'

export default class MapComponent extends Component {
  maxDepthFromCenter = 2

  private edgeContainer = createSvg('g')
  private map = document.createElement('div')
  private zoneContainer = document.createElement('div')
  private travelIcons = document.createElement('div')
  travelAnimation = new TravelAnimation(this.travelIcons)

  private transform = {
    x: 0,
    y: 0,
    scale: 1,
  }

  private zoneToComponent = new Map<GameObject, MapNode>()
  private edgeToElem = new Map<string, { line: Element, edge: Edge }>()

  private firstRender = true

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const svg = createSvg('svg')
    svg.classList.add(svgStyle)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    this.element.append(svg)

    svg.append(this.edgeContainer)

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
    const graph = getZoneGraph(centerZone, this.maxDepthFromCenter)

    for (const [zone, component] of this.zoneToComponent) {
      if (!graph.nodes.has(zone)) {
        this.removeZone(zone, component)
      }
    }

    for (const [zone, depth] of graph.nodes) {
      const component = makeOrGet(this.zoneToComponent, zone, () => {
        return this.makeZone(zone)
      })
      depth <= 1 ? component.setComplex() : component.setSimple()
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

    this.updatePositions()
    this.centerOnZone(centerZone, !this.firstRender)
    this.firstRender = false
  }

  updatePositions () {
    this.updateZonePositionsAndScale()
    for (const { line, edge } of this.edgeToElem.values()) {
      this.updateEdgePosition(line, edge)
    }
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

    this.edgeContainer.append(line)
    grow(line)

    return { line, edge }
  }

  private centerOnZone (zone: GameObject, animate = true) {
    this.transform.x = -zone.position.x * this.transform.scale
        + this.element.offsetWidth / 2
    this.transform.y = -zone.position.y * this.transform.scale +
        +this.element.offsetHeight / 2

    this.updateTransform(animate)
  }

  private updateZonePositionsAndScale () {
    const nodeScale = Math.max(1, this.transform.scale)

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

  private updateTransform (animate = true) {
    const { x, y, scale } = this.transform
    const mapScale = Math.min(1, scale)

    const edgeTransform = `${translate(x, y)} scale(${scale})`
    const mapTransform = `${translate(x, y)} scale(${mapScale})`
    const applyTransform = () => {
      this.edgeContainer.style.transform = edgeTransform
      this.map.style.transform = mapTransform
    }

    if (animate) {
      const options: KeyframeAnimationOptions = {
        duration: duration.slow,
        easing: 'ease-in-out',
      }
      this.edgeContainer.animate({
        transform: edgeTransform,
      }, options)
      this.map.animate({
        transform: mapTransform,
      }, options).onfinish = applyTransform
    } else {
      applyTransform()
    }
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
