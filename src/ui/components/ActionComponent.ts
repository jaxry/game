import Component from './Component'
import Action from '../../behavior/Action'
import { actionColor, actionTimeColor } from '../theme'
import { makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createDiv } from '../create'

export default class ActionComponent extends Component {
  private readonly time: HTMLElement

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const nameTarget = createDiv(this.element)

    const name = createDiv(nameTarget, nameStyle, action.name)

    const target = createDiv(nameTarget, targetStyle,
        action.target?.type.name ?? '')

    this.time = createDiv(this.element, timeStyle)

    this.update()
    this.on(game.event.tick, () => this.update())
  }

  update () {
    this.time.textContent = GameTime.displaySeconds(this.action.time)
  }
}

const containerStyle = makeStyle({
  gap: `1rem`,
  display: `flex`,
  alignItems: `center`,
  textAlign: `center`,
})

const nameStyle = makeStyle({
  color: actionColor,
})

const targetStyle = makeStyle({})

const timeStyle = makeStyle({
  color: actionTimeColor,
})