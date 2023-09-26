import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { addStyle, makeStyle } from '../../util/makeStyle.ts'
import { createDiv, createSpan } from '../../util/createElement.ts'
import { minorTextColor } from '../theme.ts'
import { game } from '../../main.ts'
import { componentEffect } from '../componentEffect.ts'
import Effect from '../../effects/Effect.ts'
import { LogEntry } from '../../gameLog.ts'
import { formatLogEntry } from '../formatLogEntry.ts'

export default class Log extends Component {
  constructor (public zone: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    const self = this
    componentEffect(this, class extends Effect {
      override events () {
        this.onEntityChildren('log', (entity, instance, log) => {
          self.addEntry(log.call(instance))
        })
      }
    }).activate(this.zone)
  }

  private addEntry (entry: LogEntry) {
    const atBottom = isAtBottom(this.element)

    const output = createDiv(this.element)
    createSpan(output, timeStyle, game.time.getMinuteOfHour())
    formatLogEntry(this, output, entry)

    if (atBottom) {
      scrollToBottom(this.element)
    }
  }
}

const componentStyle = makeStyle({
  fontSize: `1.5rem`,
})

const timeStyle = makeStyle({
  fontSize: `1rem`,
  color: minorTextColor,
  marginRight: `0.5rem`,
})
addStyle(`.${timeStyle}::before`, {
  content: '[',
})
addStyle(`.${timeStyle}::after`, {
  content: ']',
})

function isAtBottom (element: Element) {
  return element.scrollTop + element.clientHeight + 1 >= element.scrollHeight
}

function scrollToBottom (element: Element) {
  element.scrollTo(0, element.scrollHeight)
}