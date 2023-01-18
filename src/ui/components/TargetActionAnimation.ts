import Component from './Component'
import Action from '../../behavior/Action'
import { actionColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import bBoxDiff from '../../util'
import GameTime from '../../GameTime'

export default class TargetActionAnimation extends Component {
  constructor (action: Action, from: Element, to: Element) {
    super()

    to.append(this.element)

    this.element.classList.add(containerStyle)

    this.element.textContent = action.name

    this.element.animate({
      opacity: [0, 0.8],
    }, {
      duration: duration.fast,
      fill: 'forwards',
    })

    const fromTranslate = bBoxDiff(
        from.getBoundingClientRect(), to.getBoundingClientRect())

    const translation = this.element.animate({
      transform: [`${fromTranslate} scale(0.5)`, `translate(0, 0) scale(1) `],
    }, {
      duration: 1000 * GameTime.seconds(action.time),
      composite: 'accumulate',
      easing: 'ease-in',
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