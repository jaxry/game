import Component from './Component'
import Action from '../../behavior/Action'
import {
  actionColor, actionTargetColor, actionTimeColor, border, borderRadius,
  duration,
  fontColor,
} from '../theme'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import GameTime from '../../GameTime'

export default class ActionComponent extends Component {
  private readonly time: HTMLElement

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const nameTarget = document.createElement('div')
    this.element.append(nameTarget)

    const name = document.createElement('div')
    name.classList.add(nameStyle)
    name.textContent = action.nameActive
    nameTarget.append(name)

    const target = document.createElement('div')
    target.classList.add(targetStyle)
    target.textContent = action.target?.type.name ?? ''
    nameTarget.append(target)

    this.time = document.createElement('div')
    this.time.classList.add(timeStyle)
    this.element.append(this.time)

    this.update()

    this.element.animate({ opacity: [0, 1] }, { duration: duration.fast })
  }

  update () {
    if (this.action.time <= 0) {
      this.time.animate({
        opacity: 0,
      }, {
        duration:
        duration.fast, fill: 'forwards',
      })
    } else {
      this.time.textContent = GameTime.displaySeconds(this.action.time)
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
  gap: `1rem`,
  display: `flex`,
  alignItems: `center`,
  textAlign: `center`,
})

const nameStyle = makeStyle({
  color: actionColor
})

const targetStyle = makeStyle({
})

const timeStyle = makeStyle({
  color: actionTimeColor
})