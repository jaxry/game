import TravelAction from '../../../actions/Travel'
import { translate } from '../../../util'
import { makeStyle } from '../../makeStyle'
import { duration } from '../../theme'
import { createDiv } from '../../create'
import GameTime from '../../../GameTime'

export default class TravelAnimation {
  scale = 1

  animationState = new Set<{
    animation: Animation,
    action: TravelAction
  }>()

  constructor (public container: HTMLElement) {
  }

  start (action: TravelAction) {
    const icon = createDiv(this.container, iconStyle, action.object.type.name)

    const actionDuration = action.duration / GameTime.millisecond

    const animation = icon.animate([], {
      duration: actionDuration,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })

    const animationState = { animation, action }
    this.animationState.add(animationState)

    animation.onfinish = () => {
      icon.remove()
      this.animationState.delete(animationState)
    }

    this.setKeyframes(action, animation)

    // fade animation
    const fadeDuration = duration.normal / actionDuration
    icon.animate({
      opacity: [0, 1, 1, 0],
      offset: [0, fadeDuration, 1 - fadeDuration],
    }, { duration: actionDuration })
  }

  updateScale (newScale: number) {
    this.scale = newScale
    for (const { action, animation } of this.animationState) {
      this.setKeyframes(action, animation)
    }
  }

  private setKeyframes (action: TravelAction, animation: Animation) {
    const from = action.object.container.position
    const to = action.target.position
    const scale = this.scale

    const effect = animation.effect as KeyframeEffect
    effect.setKeyframes({
      transform: [
        `${translate(from.x * scale, from.y * scale)}`,
        `${translate(to.x * scale, to.y * scale)}`],
    })
  }
}

const iconStyle = makeStyle({
  position: `absolute`,
  pointerEvents: 'none',
  transform: `translate(-50%, -50%)`,
})