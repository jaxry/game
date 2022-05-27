import style from './ObjectInfo.module.css'
import { GameObject } from '../../GameObject'
import Window from './Window'
import $ from '../makeDomTree'
import ObjectCard from './ObjectCard'

export default class ObjectInfo extends Window {
  constructor(object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(style.container)

    const name = $('div', style.name, object.type.name)
    this.element.append(name)

    if (object.contains) {
      const inventory = $('div', style.inventory)
      this.element.append(inventory)

      for (const item of object.contains) {
        const card = this.newComponent(ObjectCard, item)
        inventory.append(card.element)
      }
    }
  }
}