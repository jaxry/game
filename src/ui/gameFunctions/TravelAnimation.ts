import TravelAction from '../../actions/Travel'
import MapNode from '../components/MapNode'
import { translate } from '../../util'
import GameTime from '../../GameTime'
import { makeStyle } from '../makeStyle'

export class TravelAnimation {
  constructor(public container: HTMLElement) {

  }

  start(action: TravelAction, from: MapNode, to: MapNode) {

    const icon = document.createElement('div')
    icon.classList.add(iconStyle)
    icon.textContent = action.object.type.name
    this.container.append(icon)

    icon.animate({
      transform: [
        `${translate(from.x, from.y)} translate(-50%, -50%)`,
        `${translate(to.x, to.y)} translate(-50%, -50%)`,
      ]
    }, {
      duration: 1000 * GameTime.seconds(action.time),
      easing: 'ease-in-out',
    }).onfinish = () => {
      icon.remove()
    }
  }
}

const iconStyle = makeStyle({
  position: `absolute`,
})

function center(elem: HTMLElement) {
  const rect = elem.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  return { x, y }
}