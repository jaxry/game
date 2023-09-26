import Component from '../../util/Component.ts'
import { Action, actionTimeLeft } from '../../effects/actions/action.ts'
import { game } from '../../main.ts'
import { createSpan } from '../../util/createElement.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { componentEffect } from '../componentEffect.ts'
import Effect from '../../effects/Effect.ts'
import Entity from '../../Entity.ts'
import { nonBreakingSpace } from '../theme.ts'
import { formatLogEntry } from '../formatLogEntry.ts'

export default class ActionDisplay extends Component {
  actionText?: ActionText

  constructor (public entity: Entity) {
    super()
  }

  override onInit () {
    this.style(containerStyle)

    this.entity.activeAction ?
        this.startAction(this.entity.activeAction) :
        this.endAction()

    const self = this
    componentEffect(this, class extends Effect {
      override events () {
        this.onEntity('actionStart', (entity, action) => {
          self.startAction(action)
        })
        this.onEntity('actionEnd', () => {
          self.endAction()
        })
      }
    }).activate(this.entity)
  }

  startAction (action: Action) {
    this.element.textContent = ''
    this.actionText?.remove()
    this.actionText =
        this.newComponent(ActionText, action).appendTo(this.element)
  }

  endAction () {
    this.actionText?.remove()
    this.actionText = undefined
    this.element.textContent = nonBreakingSpace
  }
}

const containerStyle = makeStyle({
  display: 'flex',
})

class ActionText extends Component {
  constructor (public action: Action) {
    super()
  }

  override onInit () {
    this.style(textStyle)

    formatLogEntry(this, createSpan(this.element), this.action.name())

    const time = createSpan(this.element)

    const updateTime = () => {
      time.textContent = `[${actionTimeLeft(this.action).toFixed(0)}]`
    }

    updateTime()

    this.on(game.tick, updateTime)
  }
}

const textStyle = makeStyle({
  display: 'flex',
  gap: '0.5rem',
})
