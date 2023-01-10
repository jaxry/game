import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import { border, borderRadius, boxShadow } from '../theme'
import Zone from './Zone'
import GameComponent from './GameComponent'
import Effect from '../../behavior/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'

export default class MapNode extends GameComponent {
  constructor (public zone: GameObject, map: MapComponent) {
    super()

    this.element.classList.add(containerStyle)

    const zoneComponent = this.newComponent(Zone, this.zone)
    this.element.append(zoneComponent.element)

    this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'itemActionStart', ({ action }) => {
          if (action instanceof TravelAction) {
            map.travelAnimation.start(action)
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
}

const containerStyle = makeStyle({
  position: `absolute`,
  background: colors.slate['700'],
  border,
  borderRadius,
  boxShadow,
})

