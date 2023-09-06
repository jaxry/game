import GameObject from '../../GameObject'
import Inventory from './Inventory'
import { createDiv, createElement, createSpan } from '../createElement'
import { buttonStyle, dataStyle } from '../theme'
import Window from './Window'
import { getPlayerActions } from '../../behavior/player'
import { game } from '../../Game'
import { makeStyle } from '../makeStyle'

export default class ObjectCardWindow extends Window {
  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    createDiv(this.element, undefined, this.object.type.name)

    if (this.object.energy) {
      const energy = createDiv(this.element, undefined, 'Energy: ')
      const energyValue = createSpan(energy, dataStyle)
      this.on(game.event.tick, () => {
        energyValue.textContent = this.object.energy.toString()
      })
    }

    if (this.object.type.isContainer) {
      this.newComponent(Inventory, this.object).appendTo(this.element)
    }

    const actions = createDiv(this.element, actionsStyle)

    for (const action of getPlayerActions(this.object)) {
      // add spaces to class name
      const name = action.constructor.name.replaceAll(/[A-Z]/g, ' $&')
      const button = createElement(actions, 'button', buttonStyle, name)
      button.addEventListener('click', () => {
        this.closeAll()
        action.activate()
      })
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  gap: `0.5rem`,
})

const actionsStyle = makeStyle({
  display: `flex`,
  gap: `0.25rem`,
})