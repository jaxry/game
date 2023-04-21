import Component from './Component'
import Action from '../../actions/Action'
import { actionColor, actionTimeColor, fontColor } from '../theme'
import { makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createDiv, createElement, createTextNode } from '../create'

export default class ActionComponent extends Component {

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const name = createDiv(this.element, nameStyle)
    formatName(name, action)

    const time = createDiv(this.element, timeStyle)

    function update () {
      const t = Math.max(0, action.time - game.time.current)
      time.textContent = GameTime.displaySeconds(t)
    }

    update()

    this.on(game.event.tick, update)
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