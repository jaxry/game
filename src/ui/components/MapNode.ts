import GameObject from '../../GameObject'
import Component from './Component'
import createSvg from '../createSvg'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import { duration, shadowFilter } from '../theme'
import { lerp } from '../../util'
import { playerTravelToZone } from '../../behavior/player'

export default class MapNode extends Component {

  private circle = createSvg('circle')

  constructor (public zone: GameObject) {
    super(createSvg('g'))

    const g = this.element as SVGGElement

    g.setAttribute('transform',
        `translate(${zone.position.x} ${zone.position.y})`)

    this.circle.classList.add(nodeStyle)
    this.circle.setAttribute('r', nodeSize(zone).toFixed(0))
    this.circle.onclick = () => playerTravelToZone(zone)
    g.append(this.circle)

    const fo = createSvg('foreignObject')
    fo.setAttribute('width', '50')
    fo.setAttribute('height', '50')
    fo.setAttribute('transform', 'translate(-25 -25)')
    fo.style.pointerEvents = 'none'
    g.append(fo)

    const contents = document.createElement('div')
    contents.classList.add(contentsStyle)

    for (const item of zone.contains) {
      const div = document.createElement('div')
      div.textContent = item.type.name
      contents.append(div)
    }
    fo.append(contents)
    // transitionIn(circle)
  }

  center (b: boolean) {
    this.circle.classList.toggle(centerStyle, b)
  }

  neighbor (b: boolean) {
    this.circle.classList.toggle(neighborStyle, b)
  }
}

function nodeSize (zone: GameObject) {
  return lerp(1, 6, 5, 20, zone.connections.length)
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

const contentsStyle = makeStyle({
  fontSize: '0.25rem',
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

