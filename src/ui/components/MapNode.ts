import GameObject from '../../GameObject'
import Component from './Component'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import { duration, shadowFilter } from '../theme'
import { lerp } from '../../util'

export default class MapNode extends Component {

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    // g.addEventListener('wheel', (e) => {
    //   e.stopPropagation()
    // })

    // this.circle.onclick = () => playerTravelToZone(zone)

    for (const item of zone.contains) {
      const div = document.createElement('div')
      div.textContent = item.type.name
      this.element.append(div)
    }
    // transitionIn(circle)
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
  height: '10rem',
  width: '10rem',
  overflow: 'auto',
  background: colors.slate['700'],
  borderRadius: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

