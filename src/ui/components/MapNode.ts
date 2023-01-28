import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import {
  border, borderRadius, boxShadow, duration, mapNode, mapNodeDistant,
} from '../theme'
import Zone from './Zone'
import GameComponent from './GameComponent'
import Effect from '../../behavior/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import Component from './Component'

export default class MapNode extends GameComponent {
  node: HTMLElement | Component
  zoneEffect?: Effect

  constructor (public zone: GameObject, public map: MapComponent) {
    super()

    this.element.classList.add(containerStyle)

    this.element.addEventListener('click', () => {
      playerTravelToZone(this.zone)
    })

  }

  setComplex () {
    if (this.node instanceof Component) {
      return
    }
    this.removeSimple()

    this.node = this.newComponent(Zone, this.zone)
    this.node.element.classList.add(zoneStyle)
    this.element.append(this.node.element)

    grow(this.node.element)

    const self = this
    this.zoneEffect = this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'itemActionStart', ({ action }) => {
          if (action instanceof TravelAction) {
            self.map.travelAnimation.start(action)
          }
        })
        // this.onEvent(this.object, 'itemActionEnd', ({ action }) => {
        //   // stop animation
        // })
      }
    }, this.zone)
  }

  setSimple () {
    if (this.node instanceof HTMLElement) {
      return
    }
    this.removeComplex()

    this.node = document.createElement('div')
    this.node.classList.add(circleStyle)
    this.element.append(this.node)

    grow(this.node)
  }

  private removeComplex () {
    if (!this.node) {
      return
    }

    const node = this.node as Component
    shrink(node.element).onfinish = () => {
      node.remove()
    }

    this.zoneEffect!.deactivate()
  }

  private removeSimple () {
    if (!this.node) {
      return
    }

    const node = this.node as HTMLElement
    shrink(node).onfinish = () => {
      node.remove()
    }
  }
}

function grow (elem: HTMLElement) {
  return elem.animate({
    transform: [`scale(0)`, `scale(1)`],
  }, {
    duration: duration.normal,
    composite: 'add',
    easing: 'ease-out',
  })
}

function shrink (elem: HTMLElement) {
  return elem.animate({
    transform: [`scale(1)`, `scale(0)`],
  }, {
    duration: duration.normal,
    composite: 'add',
    easing: 'ease-in',
  })
}

const containerStyle = makeStyle({
  position: `absolute`,
})

const nodeStyleStub = {
  position: `absolute`,
  transform: `translate(-50%, -50%)`,
  boxShadow,
}

const zoneStyle = makeStyle({
  ...nodeStyleStub,
  border,
  borderRadius,
  background: mapNode,
})

const circleStyle = makeStyle({
  ...nodeStyleStub,
  width: `4rem`,
  height: `4rem`,
  borderRadius: `50%`,
  background: mapNodeDistant,
})

