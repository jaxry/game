import GameObject, { ContainedAs } from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { borderRadius, boxShadow, duration, mapNodeColor } from '../theme'
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
import { createDiv } from '../createElement'

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

    const content = createDiv(this.element, contentStyle)

    this.newComponent(Inventory, this.zone, ContainedAs.inside, duration.long)
        .appendTo(content)

    animatedBackground(content, backgroundStyle, duration.long)

    // animate container to new centered position
    onResize(content, (width, height, dw, dh) => {
      this.element.animate({
        transform: [translate(dw / 2, dh / 2), `translate(0, 0)`],
      }, {
        composite: `add`,
        easing: `ease-in-out`,
        duration: duration.long,
      })
    })
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
  padding: `0.75rem`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: mapNodeColor,
  borderRadius,
  boxShadow: boxShadow,
})

