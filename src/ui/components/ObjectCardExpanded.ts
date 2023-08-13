import GameObject from '../../GameObject'
import Inventory from './Inventory'
import { createElement, createSpan } from '../createElement'
import { buttonStyle } from '../theme'
import Window from './Window'

export default class ObjectCardExpanded extends Window {
  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    createSpan(this.element, undefined, this.object.type.name)

    if (this.object.type.isContainer) {
      this.newComponent(Inventory, this.object).appendTo(this.element)
    }

    createElement(this.element, 'button', buttonStyle, `Pick up`)
  }
}