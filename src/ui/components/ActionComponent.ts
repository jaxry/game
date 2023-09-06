import Component from './Component'
import Action from '../../actions/Action'
import { actionColor, actionTimeColor, textColor } from '../theme'
import { addStyle, makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createSpan, createTextNode } from '../createElement'
import { castArray } from '../../util'

export default class ActionComponent extends Component {
  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const name = createSpan(this.element)
    formatName(name, action)

    const time = createSpan(this.element, timeStyle)

    function update () {
      const t = Math.max(0, action.finishTime - game.time.current)
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
        createSpan(container, objectStyle, n.type.name)
  }
  createTextNode(container, ` `)
}

const containerStyle = makeStyle({
  width: `max-content`,
  fontWeight: `bold`,
  color: actionColor,
})

addStyle(`.${containerStyle}::first-letter`, {
  textTransform: `capitalize`,
})

const objectStyle = makeStyle({
  color: textColor,
  fontWeight: `normal`,
})

const timeStyle = makeStyle({
  color: actionTimeColor,
})