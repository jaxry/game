import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import { border, borderRadius, boxShadow, mapNodeColor } from '../theme'
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

    // const circle = document.createElement('div')
    // circle.classList.add(circleStyle)
    // this.element.append(circle)

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
  background: mapNodeColor,
  border,
  borderRadius,
  boxShadow,
})

const circleStyle = makeStyle({
  width: `1rem`,
  height: `1rem`,

})

