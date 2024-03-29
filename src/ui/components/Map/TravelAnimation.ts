import TravelAction from '../../../actions/Travel'
import { getAndDelete } from '../../../util'
import { makeStyle } from '../../makeStyle'
import { duration } from '../../theme'
import { createDiv } from '../../createElement'
import GameTime from '../../../GameTime'

export default class TravelAnimation {
  actionToElement = new WeakMap<TravelAction, HTMLElement>()
  scale = `1`

  constructor (public container: HTMLElement) {
  }

  start (action: TravelAction) {
    const elem = createDiv(this.container, containerStyle,
        action.object.type.name)
    elem.style.scale = this.scale

    this.actionToElement.set(action, elem)

    const from = action.object.container.position
    const to = action.target.position

    const actionDuration = action.duration / GameTime.millisecond

    elem.animate({
      translate: [
        `${from.x}px ${from.y}px`,
        `${to.x}px ${to.y}px`,
      ],
    }, {
      duration: actionDuration,
      easing: 'ease',
      composite: 'add',
    }).onfinish = () => {
      this.stop(action)
    }

    // fade animation
    const fadeDuration = duration.short / actionDuration
    elem.animate({
      opacity: [0, 1, 1, 0],
      offset: [0, fadeDuration, 1 - fadeDuration],
    }, { duration: actionDuration })
  }

  stop (action: TravelAction) {
    getAndDelete(this.actionToElement, action)?.remove()
  }

  setScale (scale: string) {
    this.scale = scale
    for (const elem of this.container.children as Iterable<HTMLElement>) {
      elem.style.scale = this.scale
    }
  }
}

const containerStyle = makeStyle({
  position: `absolute`,
  pointerEvents: 'none',
  translate: `-50% -50%`,
})