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

  constructor (public zone: GameObject, map: MapComponent) {
    super()

    this.element.classList.add(containerStyle)

    this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'itemActionStart', ({ action }) => {
          if (action instanceof TravelAction) {
            map.animateTravel(action)
          }
        })
        // this.onEvent(this.object, 'itemActionEnd', ({ action }) => {
        //   // stop animation
        // })
      }
    }, this.zone)

    this.element.addEventListener('click', () => {
      playerTravelToZone(this.zone)
    })
  }

  setComplex () {
    if (this.node instanceof Component) {
      return
    }

    if (this.node) {
      const node = this.node as HTMLElement
      node.animate({
        opacity: 0,
      }, {
        duration: duration.normal,
      }).onfinish = () => node.remove()
    }

    this.node = this.newComponent(Zone, this.zone)
    this.node.element.classList.add(zoneStyle)
    this.element.append(this.node.element)

    this.node.element.animate({ opacity: [0, 1] },
        { duration: duration.normal })

  }

  setSimple () {
    if (this.node instanceof HTMLElement) {
      return
    }

    if (this.node) {
      const node = this.node as Component
      node.element.animate({
        opacity: 0,
      }, {
        duration: duration.normal,
      }).onfinish = () => node.remove()
    }

    this.node = document.createElement('div')
    this.node.classList.add(circleStyle)
    this.element.append(this.node)

    this.node.animate({ opacity: [0, 1] }, { duration: duration.normal })
  }
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

