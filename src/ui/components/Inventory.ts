import Component from './Component'
import { childStyle, makeStyle } from '../makeStyle'
import GameObject from '../../GameObject'
import { createDiv } from '../createElement'
import ObjectCard from './ObjectCard'
import { getAndDelete, makeOrGet, px } from '../../util'
import animatedContents from '../animatedContents'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import { onResize } from '../onResize'
import { duration, mapNodeColor } from '../theme'
import { fadeOutElement } from '../animatedBackground'

export default class Inventory extends GameComponent {
  objectToCard = new Map<GameObject, ObjectCard>()

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    if (this.object.contains) {
      for (const child of this.object.contains) {
        this.makeCard(child)
      }
    }

    this.newEffect(InventoryEffect, this.object, this)

    animatedContents(this.element)
  }

  makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () => {
      return this.newComponent(ObjectCard, object).appendTo(this.element)
    })
    card.element.animate({
      opacity: [`0`, `1`],
      scale: [`0`, `1`]
    }, {
      duration: duration.normal,
      easing: `ease`
    })
  }

  removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    card.element.animate({
      opacity: [`1`, `0`],
      scale: [`1`, `0`]
    }, {
      duration: duration.normal,
      easing: `ease`
    }).onfinish = () => {
      card.remove()
    }
  }
}

class InventoryEffect extends Effect {
  constructor(object: GameObject, public inventory: Inventory) {
    super(object)
  }

  override events () {
    this.onObjectChildren('enter', (child) => {
      this.inventory.makeCard(child)
    })
    this.onObjectChildren('leave', (child) => {
      this.inventory.removeCard(child)
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,

  display: `inline-flex`,
  flexDirection: `row`,
  flexWrap: `wrap`,
  alignItems: `flex-start`,
  justifyContent: `center`,
  alignContent: `center`,

  gap: `0.5rem`,
  padding: `0.5rem`,

  minWidth: `4rem`,
  minHeight: `4rem`,
  width: `max-content`,
  maxWidth: `30vw`,
})