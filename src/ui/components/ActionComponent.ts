import Component from './Component'
import Action from '../../behavior/Action'
import { actionColor, actionTimeColor, fontColor } from '../theme'
import { makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createDiv, createElement, createTextNode } from '../create'

export default class ActionComponent extends Component {
  private readonly time: HTMLElement

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const name = createDiv(this.element, nameStyle)
    formatName(name, action)

    this.time = createDiv(this.element, timeStyle)

    this.update()
    this.on(game.event.tick, () => this.update())
  }

  update () {
    this.time.textContent = GameTime.displaySeconds(this.action.time)
  }
}

function formatName (container: Element, action: Action) {
  const name = action.name
  if (typeof name === 'string') {
    container.textContent = name
  } else {
    for (const n of name) {
      typeof n === 'string' ?
          createTextNode(container, ` ${n} `) :
          createElement(container, 'span', objectStyle, n.type.name)
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  justifyContent: `center`,
  alignItems: `center`,
})

const nameStyle = makeStyle({
  color: actionColor,
})

makeStyle(`.${nameStyle}::first-letter`, {
  textTransform: `capitalize`,
})

const objectStyle = makeStyle({
  color: fontColor,
})

const timeStyle = makeStyle({
  color: actionTimeColor,
})