import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { boxShadow, mapNodeDistantColor } from '../theme'
import GameComponent from './GameComponent'
import Effect from '../../effects/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { createDiv } from '../createElement'
import { onClickNotDrag } from '../makeDraggable'

export default class MapNode extends GameComponent {


  constructor (public zone: GameObject, public map: MapComponent) {
    super()

    this.element.classList.add(containerStyle)

    onClickNotDrag(this.element, () => {
      playerTravelToZone(this.zone)
    })

    this.newEffect(TravelAnimationEffect, this.zone, this.map)

    createDiv(this.element, circleStyle)
  }
}

class TravelAnimationEffect extends Effect {
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

const circleStyle = makeStyle({
  position: `absolute`,
  translate: `-50% -50%`,
  width: `3rem`,
  height: `3rem`,
  borderRadius: `50%`,
  background: mapNodeDistantColor,
  boxShadow,
})

