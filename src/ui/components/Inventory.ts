import { makeStyle } from '../makeStyle'
import GameObject, { ContainedAs } from '../../GameObject'
import { createDiv } from '../createElement'
import ObjectCard from './ObjectCard'
import { getAndDelete, makeOrGet, reduce } from '../../util'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import { duration, fadeIn, fadeOut } from '../theme'
import animatedContents from '../animatedContents'
import { children } from '../../behavior/container'

export default class Inventory extends GameComponent {
  objectToCard = new Map<GameObject, ObjectCard>()

  constructor (
      public object: GameObject, public containerType = ContainedAs.inside) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    for (const child of children(this.object)) {
      this.makeCard(child, false)
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
    const { element, width } = shortestElement(this.element.children)
    return width > this.element.offsetHeight && element.children.length > 1 ?
        this.makeRow() : element
  }

  makeCard (object: GameObject, animate = true) {
    if (object.containedAs !== this.containerType) {
      return
    }

    makeOrGet(this.objectToCard, object, () => {
      const card = this.newComponent(ObjectCard, object)
          .appendTo(this.getShortestRow())
      animate && fadeIn(card.element, duration.long)
      return card
    })
  }

  removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    if (!card) return
    const row = card.element.parentElement!
    fadeOut(card.element, () => {
      card.remove()
      !row.children.length && row.remove()
    })
  }
}

class InventoryEffect extends Effect {
  static $serialize = false

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
  }
}

function shortestElement (elements: HTMLCollection) {
  return reduce(elements, (shortest, element) => {
    const width = (element as HTMLElement).offsetWidth
    return width < shortest.width ? { width, element } : shortest
  }, { width: Infinity, element: null as any })
}

const containerStyle = makeStyle({
  position: `relative`,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.75rem`,
})

const rowStyle = makeStyle({
  position: `relative`,
  width: `max-content`,
  display: `flex`,
  alignItems: `flex-start`,
  gap: `0.75rem`,
})