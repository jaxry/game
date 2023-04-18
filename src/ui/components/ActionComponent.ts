import Component from './Component'
import Action from '../../behavior/Action'
import { actionColor, actionTimeColor, fontColor } from '../theme'
import { makeStyle } from '../makeStyle'
import GameTime from '../../GameTime'
import { game } from '../../Game'
import { createDiv, createElement, createTextNode } from '../create'
import { Timer } from '../../Timer'

export default class ActionComponent extends Component {

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    const name = createDiv(this.element, nameStyle)
    formatName(name, action)

    const time = createDiv(this.element, timeStyle)

    let duration = action.time - game.time.current
    let start = Date.now()

    function update () {
      const t = Math.max(0,
          duration - (Date.now() - start) / GameTime.millisecond)
      time.textContent = GameTime.displaySeconds(t)
    }

    update()

    const timer = new Timer(() => {
      update()
      timer.resume(100)
    }, 100)
    this.onRemove(() => {
      timer.stop()
    })

    this.on(game.event.stopLoop, () => {
      timer.pause()
    })

    this.on(game.event.startLoop, () => {
      timer.resume()
    })
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