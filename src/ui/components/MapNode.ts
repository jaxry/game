import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import {
  border, borderRadius, boxShadow, duration, shadowFilter,
} from '../theme'
import { translate } from '../../util'
import Zone from './Zone'
import GameComponent from './GameComponent'
import Effect from '../../behavior/Effect'
import TravelAction from '../../actions/Travel'
import MapComponent from './Map'

export default class MapNode extends GameComponent {
  x: number
  y: number

  constructor (public zone: GameObject, map: MapComponent) {
    super()

    this.element.classList.add(containerStyle)

    // g.addEventListener('wheel', (e) => {
    //   e.stopPropagation()
    // })

    // this.circle.onclick = () => playerTravelToZone(zone)

    // transitionIn(circle)
    const zoneComponent = this.newComponent(Zone, this.zone)
    this.element.append(zoneComponent.element)

    this.newEffect(class extends Effect {
      override registerEvents () {
        this.onEvent(this.object, 'itemActionStart', ({ action }) => {
          if (!(action instanceof TravelAction)) {
            return
          }
          map.travelAnimation.start(action)
        })
        // this.onEvent(this.object, 'itemActionEnd', ({ item }) => {
        //
        // })
      }
    }, this.zone)
  }

  setPosition (x: number, y: number) {
    this.x = x
    this.y = y
    this.element.style.transform = `${translate(x, y)} translate(-50%,-50%)`
  }

  center (b: boolean) {
    // this.circle.classList.toggle(centerStyle, b)
  }

  neighbor (b: boolean) {
    // this.circle.classList.toggle(neighborStyle, b)
  }
}

const nodeStyle = makeStyle({
  fill: colors.slate['700'],
  filter: shadowFilter,
  cursor: `pointer`,
  transition: `all ${duration.fast}ms`,
})

const neighborStyle = makeStyle({
  fill: colors.sky['500'],
})

const centerStyle = makeStyle({
  fill: colors.green['400'],
  filter: `${shadowFilter} drop-shadow(0 0 0.25rem ${colors.green['400']})`,
})

const containerStyle = makeStyle({
  position: `absolute`,
  background: colors.slate['700'],
  border,
  borderRadius,
  boxShadow,
})

