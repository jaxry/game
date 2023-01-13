import TravelAction from '../../actions/Travel'
import { translate } from '../../util'
import GameTime from '../../GameTime'
import { makeStyle } from '../makeStyle'
import { duration } from '../theme'

export class TravelAnimation {
  scale = 1

  animationState = new Set<{
    animation: Animation,
    action: TravelAction
  }>()

  constructor (public container: HTMLElement) {
  }

  start (action: TravelAction) {
    const icon = document.createElement('div')
    icon.classList.add(iconStyle)
    icon.textContent = action.object.type.name
    this.container.append(icon)

    const actionDuration = 1000 * GameTime.seconds(action.time)

    const animation = icon.animate([], {
      duration: actionDuration,
      easing: 'ease-in-out',
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

  private setKeyframes (action: TravelAction, animation: Animation) {
    const from = action.object.container.position
    const to = action.target.position
    const s = this.scale

    const effect = animation.effect as KeyframeEffect
    effect.setKeyframes({
      transform: [
        `${translate(from.x * s, from.y * s)} translate(-50%, -50%)`,
        `${translate(to.x * s, to.y * s)} translate(-50%, -50%)`],
    })
  }

  updateScale (newScale: number) {
    this.scale = newScale
    for (const { action, animation } of this.animationState) {
      this.setKeyframes(action, animation)
    }
  }
}

const iconStyle = makeStyle({
  position: `absolute`,
  pointerEvents: 'none',
})