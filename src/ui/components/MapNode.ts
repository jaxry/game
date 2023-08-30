import GameObject, { ContainedAs } from '../../GameObject'
import { makeStyle } from '../makeStyle'
import {
  borderRadius, boxShadow, duration, fadeIn, mapNodeColor, mapNodeSimpleColor,
} from '../theme'
import GameComponent from './GameComponent'
import Effect from '../../effects/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { onClickNotDrag } from '../makeDraggable'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutAbsolute,
} from '../animatedBackground'
import { moveToTop, translate } from '../../util'
import Inventory from './Inventory'
import { onResize } from '../onResize'
import { createDiv } from '../createElement'

export default class MapNode extends GameComponent {
  content = createDiv(this.element, contentStyle)
  background = animatedBackground(this.content, backgroundStyle, duration.long)
  inventory?: Inventory

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

    // animate container to new centered position
    onResize(this.content, (width, height, dw, dh) => {
      this.element.animate({
        transform: [translate(dw / 2, dh / 2), `translate(0, 0)`],
      }, {
        composite: `add`,
        easing: `ease-in-out`,
        duration: duration.long,
      })
    })
  }

  fullZone () {
    if (this.inventory) return
    this.inventory = this.newComponent(Inventory, this.zone, ContainedAs.inside,
        duration.long).appendTo(this.content)
    this.inventory.element.classList.add(inventoryStyle)
    fadeIn(this.inventory.element)
    this.background.classList.add(fullBackgroundStyle)
  }

  simpleZone () {
    if (!this.inventory) return
    this.background.classList.remove(fullBackgroundStyle)
    const inventory = this.inventory
    this.inventory = undefined
    fadeOutAbsolute(inventory.element, () => inventory.remove())
  }
}

class TravelAnimationEffect extends Effect {
  static $serialize = false

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

const contentStyle = makeStyle({
  position: `absolute`,
  translate: `-50% -50%`,
  minWidth: `3rem`,
  minHeight: `3rem`,
  padding: `1rem`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  boxShadow: boxShadow,
  borderRadius: `50%`,
  background: mapNodeSimpleColor,
  transition: `all ${duration.long}ms ease`,
})

const fullBackgroundStyle = makeStyle({
  borderRadius,
  background: mapNodeColor,
})

const inventoryStyle = makeStyle({
  transformOrigin: `center`,
})

