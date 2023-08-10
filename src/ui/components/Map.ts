import Component from './Component'
import { Edge, getEdgeHash, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { duration, fadeIn, fadeOut, mapEdgeColor } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../addPanZoom'
import { makeOrGet, px, translate } from '../../util'
import TravelAnimation from './Map/TravelAnimation'
import { createDiv } from '../createElement'
import makeDraggable from '../makeDraggable'
import ForceDirectedSim from '../../map/ForceDirectedSim'
import throttle from '../throttle'

export default class MapComponent extends Component {
  maxDepthFromCenter = 2
  depthForComplexZones = 1

  private map = createDiv(this.element, mapStyle)
  private edgeContainer = createDiv(this.map)
  private zoneContainer = createDiv(this.map, zoneContainerStyle)
  private travelIcons = createDiv(this.map)
  travelAnimation = new TravelAnimation(this.travelIcons)
  private transform = {
    x: 0,
    y: 0,
    scale: 1,
  }
  private zoneToComponent = new Map<GameObject, MapNode>()
  private edgeToElem = new Map<string, { line: HTMLElement, edge: Edge }>()
  updatePositions = throttle(() => {

    for (const [zone, component] of this.zoneToComponent) {
      component.element.style.translate =
          `${zone.position.x}px ${zone.position.y}px`
    }

    for (const { line, edge } of this.edgeToElem.values()) {
      const { x, y, angle, length } = getEdgePositionAndAngle(edge)
      line.style.translate = `${x}px ${y}px`
      line.style.rotate = `${angle}rad`
      line.style.width = px(length)
    }
  })
  private firstRender = true
  private forceDirectedSim = new ForceDirectedSim()

  override onInit () {
    this.element.classList.add(containerStyle)

    addPanZoom(this.element, this.transform, (updateScale) => {
      updateScale && this.updateScale()
      this.updateTransform(false)
    })

    this.forceDirectedSim.onUpdate = () => {
      this.updatePositions()
    }
  }

  render (centerZone: GameObject, panToCenter = false, startForceSim = false) {
    const graph = getZoneGraph(centerZone, this.maxDepthFromCenter)

    for (const [zone, depth] of graph.nodes) {
      const component = makeOrGet(this.zoneToComponent, zone, () => {
        return this.makeNode(zone)
      })
      // component.setDepth(depth)
    }

    for (const [zone, component] of this.zoneToComponent) {
      !graph.nodes.has(zone) && this.removeNode(zone, component)
    }

    const currentEdges = new Set<string>()
    for (const edge of graph.edges) {
      const hash = getEdgeHash(edge)
      currentEdges.add(hash)
      makeOrGet(this.edgeToElem, hash, () => {
        return this.makeEdge(edge)
      })
    }

    for (const [hash, { line }] of this.edgeToElem) {
      !currentEdges.has(hash) && this.removeEdge(hash, line)
    }

    this.updatePositions()
    this.updateScale()

    if (this.firstRender) {
      this.forceDirectedSim.simulateFully(centerZone)
    } else if (startForceSim) {
      this.forceDirectedSim.stop()
      this.forceDirectedSim.animate(centerZone)
    }

    if (panToCenter) {
      this.centerOnZone(centerZone, !this.firstRender)
    }

    this.firstRender = false
  }

  private makeNode (zone: GameObject) {
    const node = this.newComponent(MapNode, zone, this)
        .appendTo(this.zoneContainer)

    makeDraggable(node.element, {
      onDown: () => {
        this.forceDirectedSim.freeze(zone)
      },
      onUp: () => {
        this.forceDirectedSim.unfreeze(zone)
      },
      onDrag: (e) => {
        zone.position.x += e.movementX / this.transform.scale
        zone.position.y += e.movementY / this.transform.scale
        this.forceDirectedSim.animate(zone)
      },
    })

    fadeIn(node.element)

    return node
  }

  private removeNode (zone: GameObject, component: MapNode) {
    fadeOut(component.element, () => {
      component.remove()
    })
    this.zoneToComponent.delete(zone)
  }

  private makeEdge (edge: Edge) {
    const line = createDiv(this.edgeContainer, edgeStyle)
    fadeIn(line)
    return { line, edge }
  }

  private removeEdge (hash: string, line: HTMLElement) {
    fadeOut(line, () => {
      line.remove()
    })
    this.edgeToElem.delete(hash)
  }

  private centerOnZone (zone: GameObject, animate = true) {
    this.transform.x = -zone.position.x * this.transform.scale
        + this.element.offsetWidth / 2
    this.transform.y = -zone.position.y * this.transform.scale +
        +this.element.offsetHeight / 2

    this.updateTransform(animate)
  }

  private updateScale () {
    const invScale = (1 / this.transform.scale).toString()
    // const invScale = `1`
    for (const component of this.zoneToComponent.values()) {
      component.element.style.transform = `scale(${invScale})`
    }

    for (const { line } of this.edgeToElem.values()) {
      line.style.scale = `scale(1, ${invScale})`
    }

    this.travelAnimation.setScale(invScale)
  }

  private updateTransform (animate = true) {
    const { x, y, scale } = this.transform

    const transform = `${translate(x, y)} scale(${scale})`

    this.map.animate({
      transform: transform,
    }, {
      duration: animate ? duration.long : 0,
      easing: 'ease-in-out',
      fill: 'forwards',
    }).commitStyles()
  }
}

const edgeWidth = 2

function getEdgePositionAndAngle ({ source, target }: Edge) {
  const dirX = target.position.x - source.position.x
  const dirY = target.position.y - source.position.y
  const length = Math.sqrt(dirX * dirX + dirY * dirY)
  const angle = Math.atan2(dirY, dirX)
  const x = 0.5 * (source.position.x + target.position.x - length)
  const y = 0.5 * (source.position.y + target.position.y - edgeWidth)
  return { x, y, angle, length }
}

const containerStyle = makeStyle({
  position: 'relative',
  contain: `strict`,
  userSelect: `none`,
})

const zoneContainerStyle = makeStyle({
  position: `relative`,
  zIndex: `0`,
})

const mapStyle = makeStyle({
  position: `absolute`,
})

const edgeStyle = makeStyle({
  position: `absolute`,
  background: mapEdgeColor,
  height: `${edgeWidth}px`,
  transformOrigin: `center center`,
})
