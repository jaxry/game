import { makeStyle } from '../makeStyle'
import GameObject from '../../GameObject'
import { createDiv } from '../createElement'
import ObjectCard from './ObjectCard'
import { getAndDelete, makeOrGet } from '../../util'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import { duration } from '../theme'
import animatedContents from '../animatedContents'

export default class Inventory extends GameComponent {
  objectToCard = new Map<GameObject, ObjectCard>()
  rows = createDiv(this.element, rowsContainerStyle)

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

    animatedContents(this.rows)
  }

  makeRow () {
    const row = createDiv(this.rows, rowStyle)
    animatedContents(row)
    return row
  }

  getShortestRow () {
    if (!this.rows.children.length) {
      return this.makeRow()
    }
    const { element, width } = shortestElement(
        [...this.rows.children] as HTMLElement[])
    return width > this.rows.offsetHeight ? this.makeRow() : element
  }

  makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () => {
      return this.newComponent(ObjectCard, object)
          .appendTo(this.getShortestRow())
    })
    card.element.animate({
      opacity: [`0`, `1`],
      scale: [`0`, `1`],
    }, {
      duration: duration.normal,
      easing: `ease`,
    })
  }

  removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    const row = card.element.parentElement!
    card.element.animate({
      opacity: [`1`, `0`],
      scale: [`1`, `0`]
    }, {
      duration: duration.normal,
      easing: `ease`
    }).onfinish = () => {
      card.remove()
      if (!row.children.length) {
        row.remove()
      }
    }
  }
}

class InventoryEffect extends Effect {
  static ignoreSerialize = true
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
    this.onObjectChildren('actionStart', (child) => {
      this.inventory.objectToCard.get(child)!.showAction()
    })
    this.onObjectChildren('actionEnd', (child) => {
      this.inventory.objectToCard.get(child)!.hideAction()
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
})

const rowsContainerStyle = makeStyle({
  minWidth: `3rem`,
  minHeight: `3rem`,
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