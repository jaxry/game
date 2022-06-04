import style from './ObjectInfo.module.css'
import { GameObject } from '../../GameObject'
import Window from './Window'
import Inventory from './Inventory'

export default class ObjectInfo extends Window {
  constructor(object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(style.container)

    const name = document.createElement('div')
    name.classList.add(style.name)
    name.textContent = object.type.name
    this.element.append(name)

    if (object.contains) {
      const inventory = this.newComponent(Inventory, object)
      this.element.append(inventory.element)
    }
  }
}