import Component from './Component'
import createSvg from '../createSvg'
import { Edge, getZoneGraph } from '../../behavior/connections'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { backgroundColor, duration } from '../theme'
import MapNode from './MapNode'
import addPanZoom from '../PanZoom'
import { numToPixel, translate } from '../../util'
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
    scale: 8,
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
    this.map.append(this.zoneContainer)
    this.map.append(this.travelIcons)

    this.element.append(this.map)

    addPanZoom(this.element, this.transform, (updatedScale) => {
      updatedScale && this.updateScale()
      this.updateTranslation(false)
    })
  }

  setCenter (centerZone: GameObject) {
    const graph = getZoneGraph(centerZone, 2)

    for (const [zone, component] of this.zoneToComponent) {
      if (!graph.nodes.has(zone)) {
        this.removeZone(zone, component)
      }
    }

    for (const node of graph.nodes) {
      if (!this.zoneToComponent.has(node)) {
        this.makeZone(node)
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
        this.makeEdge(hash, edge)
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

    this.centerOnZone(centerZone)
  }

  private makeZone (zone: GameObject) {
    const component = this.newComponent(MapNode, zone, this)
    this.zoneContainer.append(component.element)
    this.zoneToComponent.set(zone, component)
    component.element.animate({
      transform: ['scale(0)', 'scale(1)'],
    }, {
      duration: duration.slow,
      composite: 'add',
    })

  }

  private removeZone (zone: GameObject, component: MapNode) {
    component.element.animate({
      transform: `scale(0)`,
    }, {
      duration: duration.slow,
      composite: 'add',
    }).onfinish = () => {
      component.remove()
    }
    this.zoneToComponent.delete(zone)
  }

  private makeEdge (hash: string, edge: Edge) {
    const line = createSvg('line')
    line.classList.add(edgeStyle)
    this.edgeG.append(line)
    transitionIn(line)
    this.edgeToElem.set(hash, { line, edge })
  }

  private centerOnZone (zone: GameObject) {
    this.transform.x = -zone.position.x * this.transform.scale
        + this.element.offsetWidth / 2
    this.transform.y = -zone.position.y * this.transform.scale +
        +this.element.offsetHeight / 2

    this.updateScale()
    this.updateTranslation()
  }

  private updateScale () {
    const s = this.transform.scale

    for (const [zone, component] of this.zoneToComponent) {
      const x = zone.position.x * s
      const y = zone.position.y * s
      component.element.style.transform =
          `${translate(x, y)} translate(-50%, -50%)`
    }

    for (const { edge, line } of this.edgeToElem.values()) {
      line.setAttribute('x1', numToPixel(edge.source.position.x * s))
      line.setAttribute('y1', numToPixel(edge.source.position.y * s))
      line.setAttribute('x2', numToPixel(edge.target.position.x * s))
      line.setAttribute('y2', numToPixel(edge.target.position.y * s))
    }

    this.travelAnimation.updateScale(s)
  }

  private updateTranslation (animate = true) {
    const transform = translate(this.transform.x, this.transform.y)
    const options: KeyframeAnimationOptions = {
      duration: animate ? duration.slow : 0,
      fill: 'forwards',
      easing: 'ease-in-out',
    }
    this.map.animate({ transform }, options).commitStyles()
    this.edgeG.animate({ transform }, options).commitStyles()
  }
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
