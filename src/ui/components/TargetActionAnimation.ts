import Component from './Component'
import Action from '../../behavior/Action'
import { actionColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { translateDiff } from '../../util'

export default class TargetActionAnimation extends Component {
  constructor (action: Action, from: Element, to: Element) {
    super()

    to.append(this.element)

    this.element.classList.add(containerStyle)

    this.element.textContent = action.name

    this.element.animate({
      opacity: [`0`, `1`],
    }, {
      duration: duration.fast,
      fill: 'forwards',
    })

    const translation = this.element.animate({
      transform: [translateDiff(from, to), `translate(0, 0)`],
    }, {
      duration: 1000 * GameTime.seconds(action.time),
      composite: 'accumulate',
      easing: 'ease-in-out',
    })

    translation.onfinish = () => {
      this.exit()
    }
  }

  exit () {
    this.element.animate({
      opacity: 0,
    }, {
      duration: duration.fast,
    }).onfinish = () => {
      this.remove()
    }
  }
}

const containerStyle = makeStyle({
  position: 'absolute',
  pointerEvents: `none`,
  zIndex: `999`,
  color: actionColor,
})