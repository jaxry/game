import Component from './Component'
import Action from '../../actions/Action'
import { actionColor, actionTimeColor, fontColor } from '../theme'
import { addStyle, makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createDiv, createElement, createTextNode } from '../createElement'
import { castArray } from '../../util'

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
  for (const n of castArray(action.name)) {
    typeof n === 'string' ?
        createTextNode(container, ` ${n} `) :
        createElement(container, 'span', objectStyle, n.type.name)
  }
}

const containerStyle = makeStyle({
  width: `max-content`,
  display: `flex`,
  flexDirection: `row`,
  gap: `0.5rem`,
  fontWeight: `bold`,
})

const nameStyle = makeStyle({
  color: actionColor,
})

addStyle(`.${nameStyle}::first-letter`, {
  textTransform: `capitalize`,
})

const objectStyle = makeStyle({
  color: fontColor,
  fontWeight: `normal`,
})

const timeStyle = makeStyle({
  color: actionTimeColor,
})