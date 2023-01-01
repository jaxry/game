import GameObject from '../../GameObject'
import Component from './Component'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import { border, borderRadius, duration, shadowFilter } from '../theme'
import { lerp } from '../../util'
import Zone from './Zone'

export default class MapNode extends Component {

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    // g.addEventListener('wheel', (e) => {
    //   e.stopPropagation()
    // })

    // this.circle.onclick = () => playerTravelToZone(zone)

    // transitionIn(circle)
    const zoneComponent = this.newComponent(Zone, this.zone)
    this.element.append(zoneComponent.element)
  }

  center (b: boolean) {
    // this.circle.classList.toggle(centerStyle, b)
  }

  neighbor (b: boolean) {
    // this.circle.classList.toggle(neighborStyle, b)
  }
}

function nodeSize (zone: GameObject) {
  return lerp(1, 6, 20, 80, zone.connections.length)
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
  // overflow: 'auto',
  background: colors.slate['700'],
  border,
  borderRadius,
})

