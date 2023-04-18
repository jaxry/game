import Component from './Component'
import { Edge, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { duration, mapEdgeColor } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { makeOrGet, numToPixel, numToPx, translate } from '../../util'
import TravelAnimation from '../game/TravelAnimation'
import { createDiv } from '../create'

export default class MapComponent extends Component {
  maxDepthFromCenter = Infinity
  depthForComplexZones = Infinity

  private map = createDiv(this.element, mapStyle)
  private edgeContainer = createDiv(this.map)
  private zoneContainer = createDiv(this.map)
  private travelIcons = createDiv(this.map)
  travelAnimation = new TravelAnimation(this.travelIcons)

  private transform = {
    x: 0,
    y: 0,
    scale: 1,
  }

  private zoneToComponent = new Map<GameObject, MapNode>()
  private edgeToElem = new Map<string, { line: HTMLElement, edge: Edge }>()

  private firstRender = true
  private activeMapAnimation: Animation | undefined

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    addPanZoom(this.element, this.transform, (updatedScale) => {
      updatedScale && this.updatePositions()
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
      depth <= this.depthForComplexZones ?
          component.setComplex() : component.setSimple()
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
    const nodeScale = Math.max(1, this.transform.scale)

    for (const [zone, component] of this.zoneToComponent) {
      const x = zone.position.x * nodeScale
      const y = zone.position.y * nodeScale
      component.element.style.transform = translate(x, y)
    }

    for (const { line, edge } of this.edgeToElem.values()) {
      const { x, y, angle, length } = getEdgePositionAndAngle(edge)
      const t = translate(x * nodeScale, y * nodeScale)
      const r = `rotate(${numToPixel(angle)}rad)`
      line.style.transform = `translate(-50%,-50%)${t}${r}`
      line.style.width = numToPx(length * nodeScale)
    }

    this.travelAnimation.updateScale(nodeScale)
  }

  private makeZone (zone: GameObject) {
    return this.newComponent(this.zoneContainer, MapNode, zone, this)
  }

  private removeZone (zone: GameObject, component: MapNode) {
    shrink(component.element).onfinish = () => {
      component.remove()
    }
    this.zoneToComponent.delete(zone)
  }

  private makeEdge (edge: Edge) {
    const line = createDiv(this.edgeContainer)
    line.classList.add(edgeStyle)

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

  private updateTransform (animate = true) {
    const { x, y, scale } = this.transform
    const mapScale = Math.min(1, scale)

    const transform = `${translate(x, y)} scale(${mapScale})`

    this.activeMapAnimation?.finish()
    this.activeMapAnimation = undefined

    if (animate) {
      this.activeMapAnimation = this.map.animate({
        transform: transform,
      }, {
        duration: duration.slow,
        easing: 'ease-in-out',
      })

      this.activeMapAnimation.onfinish = () => {
        this.map.style.transform = transform
      }
      // have to apply transform manually, since using
      // fill: 'forwards' or commitStyles() prevents future manual transforms
    } else {
      this.map.style.transform = transform
    }
  }
}

function grow (elem: Element) {
  return elem.animate({
    transform: ['scale(0)', 'scale(1)'],
  }, {
    duration: duration.slow,
    easing: 'ease',
    composite: 'add',
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

function getEdgePositionAndAngle ({ source, target }: Edge) {
  const dirX = target.position.x - source.position.x
  const dirY = target.position.y - source.position.y
  const length = Math.sqrt(dirX * dirX + dirY * dirY)
  const angle = Math.atan2(dirY, dirX)
  const x = (source.position.x + target.position.x) / 2
  const y = (source.position.y + target.position.y) / 2
  return { x, y, angle, length }
}

const containerStyle = makeStyle({
  position: 'relative',
  contain: `strict`,
})

const mapStyle = makeStyle({
  position: `absolute`,
  transformOrigin: `top left`,
})

const edgeStyle = makeStyle({
  position: `absolute`,
  borderTop: `2px solid ${mapEdgeColor}`,
})
