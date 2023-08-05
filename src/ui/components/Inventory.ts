import { makeStyle } from '../makeStyle'
import GameObject from '../../GameObject'
import { createDiv } from '../createElement'
import ObjectCard from './ObjectCard'
import { getAndDelete, makeOrGet } from '../../util'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import { duration } from '../theme'

export default class Inventory extends GameComponent {
  objectToCard = new Map<GameObject, ObjectCard>()
  rows: HTMLElement[] = []

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    this.makeRow()

    if (this.object.contains) {
      for (const child of this.object.contains) {
        this.makeCard(child)
      }
    }

    this.newEffect(InventoryEffect, this.object, this)

    // animatedContents(this.element)
  }

  makeRow () {
    const newRow = createDiv(this.element, rowStyle)
    this.rows.push(newRow)
    return newRow
  }

  getShortestRow () {
    const { element, width } = shortestElement(this.rows)
    return width > this.element.offsetHeight ? this.makeRow() : element
  }

  makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () => {
      return this.newComponent(ObjectCard, object)
          .appendTo(this.getShortestRow())
    })
    // card.element.animate({
    //   opacity: [`0`, `1`],
    //   scale: [`0`, `1`]
    // }, {
    //   duration: duration.normal,
    //   easing: `ease`
    // })
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

function shortestElement (elements: HTMLElement[]) {
  return elements.reduce((shortest, element) => {
    const width = element.offsetWidth
    return width < shortest.width ? { width, element } : shortest
  }, { width: Infinity, element: null as any as HTMLElement })
}

const containerStyle = makeStyle({
  position: `relative`,

  padding: `0.5rem`,

  minWidth: `4rem`,
  minHeight: `4rem`,
})

const rowStyle = makeStyle({
  display: `flex`,
  width: `max-content`,
})