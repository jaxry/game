import Component from './Component'
import { Edge, getEdgeHash, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { duration, mapEdgeColor } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { makeOrGet, numToPixel, numToPx, translate } from '../../util'
import TravelAnimation from './Map/TravelAnimation'
import { createDiv } from '../create'
import makeDraggable from '../makeDraggable'
import ForceDirectedSim from '../../map/ForceDirectedSim'
import throttle from '../throttle'

export default class MapComponent extends Component {
  maxDepthFromCenter = 3
  depthForComplexZones = 1

  private map = createDiv(this.element, mapStyle)
  private edgeContainer = createDiv(this.map)
  private zoneContainer = createDiv(this.map)
  private travelIcons = createDiv(this.map)
  updatePositions = throttle(() => {
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
  })

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
  private forceDirectedSim = new ForceDirectedSim()

  render (centerZone: GameObject, animateToCenter = false) {
    const graph = getZoneGraph(centerZone, this.maxDepthFromCenter)

    for (const [zone, component] of this.zoneToComponent) {
      if (!graph.nodes.has(zone)) {
        this.removeNode(zone, component)
      }
    }

    for (const [zone, depth] of graph.nodes) {
      const component = makeOrGet(this.zoneToComponent, zone, () => {
        return this.makeNode(zone)
      })
      depth <= this.depthForComplexZones ?
          component.setComplex() : component.setSimple()
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
      if (!currentEdges.has(hash)) {
        shrink(line).onfinish = () => {
          line.remove()
        }
        this.edgeToElem.delete(hash)
      }
    }

    this.updatePositions()

    if (this.firstRender) {
      this.forceDirectedSim.simulateFully(centerZone)
    }

    if (animateToCenter) {
      this.centerOnZone(centerZone, !this.firstRender)
    }

    this.firstRender = false
  }

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    addPanZoom(this.element, this.transform, (updatedScale) => {
      updatedScale && this.updatePositions()
      this.updateTransform(false)
    })

    this.forceDirectedSim.onUpdate = () => {
      this.updatePositions()
    }
  }

  private makeNode (zone: GameObject) {
    const node = this.newComponent(this.zoneContainer, MapNode, zone, this)
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
    return node
  }

  private removeNode (zone: GameObject, component: MapNode) {
    shrink(component.element).onfinish = () => {
      component.remove()
    }
    this.zoneToComponent.delete(zone)
  }

  private makeEdge (edge: Edge) {
    const line = createDiv(this.edgeContainer, edgeStyle)
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
