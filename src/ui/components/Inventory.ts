import { makeStyle } from '../makeStyle'
import GameObject from '../../GameObject'
import { createDiv } from '../createElement'
import ObjectCard from './ObjectCard'
import { getAndDelete, makeOrGet } from '../../util'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import { duration, fadeIn, fadeOut } from '../theme'
import animatedContents from '../animatedContents'

export default class Inventory extends GameComponent {
  objectToCard = new Map<GameObject, ObjectCard>()

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    if (this.object.contains) {
      for (const child of this.object.contains) {
        this.makeCard(child, false)
      }
    }

    this.newEffect(InventoryEffect, this.object, this)

    animatedContents(this.element, duration.long, true)
  }

  makeRow () {
    const row = createDiv(this.element, rowStyle)
    animatedContents(row, duration.long, true)
    return row
  }

  getShortestRow () {
    if (!this.element.children.length) {
      return this.makeRow()
    }
    const { element, width } = shortestElement(
        [...this.element.children] as HTMLElement[])
    return width > this.element.offsetHeight ? this.makeRow() : element
  }

  makeCard (object: GameObject, animate = true) {
    const card = makeOrGet(this.objectToCard, object, () => {
      return this.newComponent(ObjectCard, object)
          .appendTo(this.getShortestRow())
    })
    animate && fadeIn(card.element, duration.long)
  }

  removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    const row = card.element.parentElement!
    fadeOut(card.element, () => {
      card.remove()
      if (!row.children.length) {
        row.remove()
      }
    })
  }
}

class InventoryEffect extends Effect {
  static ignoreSerialize = true

  constructor (object: GameObject, public inventory: Inventory) {
    super(object)
  }

  override events () {
    this.onObjectChildren('enter', (child) => {
      this.inventory.makeCard(child)
    })
    this.onObjectChildren('leave', (child) => {
      this.inventory.removeCard(child)
    })
    this.onObjectChildren('actionStart', (child) => {
      this.inventory.objectToCard.get(child)!.showAction(child.activeAction)
    })
    this.onObjectChildren('actionEnd', (child) => {
      this.inventory.objectToCard.get(child)!.hideAction()
    })
    this.onObjectChildren('speak', (child, message) => {
      this.inventory.objectToCard.get(child)!.showMessage(message)
    })
  }
}

function shortestElement (elements: HTMLElement[]) {
  return elements.reduce((shortest, element) => {
    const width = element.offsetWidth
    return width < shortest.width ? { width, element } : shortest
  }, { width: Infinity, element: null as any as HTMLElement })
}

const containerStyle = makeStyle({
  position: `relative`,
  padding: `0.5rem`,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.5rem`,
})

const rowStyle = makeStyle({
  position: `relative`,
  width: `max-content`,
  display: `flex`,
  alignItems: `flex-start`,
  gap: `0.5rem`,
})