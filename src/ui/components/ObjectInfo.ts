import style from './ObjectInfo.module.css'
import { GameObject } from '../../GameObject'
import Window from './Window'
import $ from '../makeDomTree'
import Inventory from './Inventory'

export default class ObjectInfo extends Window {
  constructor(object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(style.container)

    const name = $('div', style.name, object.type.name)
    this.element.append(name)

    if (object.contains) {
      const inventory = this.newComponent(Inventory, object)
      this.element.append(inventory.element)
    }
  }
}