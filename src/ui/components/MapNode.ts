import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import {
  borderRadius, boxShadow, duration, mapNodeColor, mapNodeDistantColor,
} from '../theme'
import GameComponent from './GameComponent'
import Effect from '../../effects/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { onClickNotDrag } from '../makeDraggable'
import animatedBackground, {
  animatedBackgroundTemplate,
} from '../animatedBackground'
import { moveToTop, translate } from '../../util'
import Inventory from './Inventory'
import { onResize } from '../onResize'

export default class MapNode extends GameComponent {

  constructor (public zone: GameObject, public map: MapComponent) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    this.element.addEventListener('pointerenter', () => {
      moveToTop(this.element)
    })

    onClickNotDrag(this.element, () => {
      playerTravelToZone(this.zone)
    })

    this.newEffect(TravelAnimationEffect, this.zone, this.map)

    // createDiv(this.element, circleStyle)
    const inventory = this.newComponent(Inventory, this.zone)
        .appendTo(this.element)

    inventory.element.classList.add(childStyle)
    animatedBackground(inventory.element, backgroundStyle)

    // animate container to new centered position
    onResize(inventory.element, (width, height, dw, dh) => {
      this.element.animate({
        transform: [translate(dw / 2, dh / 2), `translate(0, 0)`],
      }, {
        composite: `add`,
        easing: `ease`,
        duration: duration.normal,
      })
    })
  }
}

class TravelAnimationEffect extends Effect {
  static ignoreSerialize = true
  constructor (zone: GameObject, public map: MapComponent) {
    super(zone)
  }

  override events () {
    this.onObjectChildren('actionStart', (object, action) => {
      if (action instanceof TravelAction) {
        this.map.travelAnimation.start(action)
      }
    })
    this.onObjectChildren('actionEnd', (object, action) => {
      if (action instanceof TravelAction) {
        this.map.travelAnimation.stop(action)
      }
    })
  }
}

const containerStyle = makeStyle({
  position: `absolute`,
})

const childStyle = makeStyle({
  position: `absolute`,
  translate: `-50% -50%`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: mapNodeColor,
  borderRadius,
})

const circleStyle = makeStyle({
  position: `absolute`,
  translate: `-50% -50%`,
  width: `3rem`,
  height: `3rem`,
  borderRadius: `50%`,
  background: mapNodeDistantColor,
  boxShadow,
})

