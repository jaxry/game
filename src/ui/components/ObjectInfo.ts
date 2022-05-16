import style from './ObjectInfo.module.css'
import { GameObject } from '../../GameObject'
import FloatingBox from './FloatingBox'
import { isPlayer } from '../../behavior/player'
import { startPlayerBehavior } from '../../behavior/core'
import WaitAction from '../../actions/Wait'
import $ from '../makeDomTree'
import ObjectCard from './ObjectCard'

export default class ObjectInfo extends FloatingBox {
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