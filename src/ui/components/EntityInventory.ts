import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { getAndDelete, makeOrGet } from '../../util/util.ts'
import EntityCard from './EntityCard.ts'
import { createDiv } from '../../util/createElement.ts'
import { entityChildren } from '../../logic/container.ts'
import makeSwappable from '../makeSwappable.ts'
import { componentEffect } from '../componentEffect.ts'
import Effect from '../../effects/Effect.ts'

export default class EntityInventory extends Component {
  entityToCard = new Map<Entity, EntityCard>()
  freeSlots = new Set<Element>()

  constructor (public entity: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    entityChildren(this.entity, (child) => {
      this.addEntity(child)
    })

    const self = this
    componentEffect(this, class extends Effect {
      override events () {
        this.onEntityChildren('enter', (entity) => {
          self.addEntity(entity)
        })
        this.onEntityChildren('leave', (entity) => {
          self.removeEntity(entity)
        })
      }
    }).activate(this.entity)
  }

  private addEntity (entity: Entity) {
    const card = makeOrGet(this.entityToCard, entity, () => {
      return this.newComponent(EntityCard, entity).style(cardStyle)
    })

    const existingSlot = this.getFreeSlot()
    existingSlot ? card.replaceElement(existingSlot) :
        card.appendTo(this.element)
  }

  private removeEntity (entity: Entity) {
    const card = getAndDelete(this.entityToCard, entity)!

    if (!isLastChild(card.element)) {
      const slot = createDiv(null, cardStyle)
      makeSwappable(slot)
      this.freeSlots.add(slot)
      card.element.replaceWith(slot)
    }

    card.remove()
    this.removeEmptyBottomContainers()
  }

  private getFreeSlot () {
    for (const slot of this.freeSlots) {
      this.freeSlots.delete(slot)
      return slot
    }
  }

  private removeEmptyBottomContainers () {
    while (this.freeSlots.has(this.element.lastElementChild!)) {
      const last = this.element.lastElementChild!
      this.freeSlots.delete(last)
      last.remove()
    }
  }
}

const componentStyle = makeStyle({
  display: `flex`,
  flexWrap: `wrap`,
  alignContent: `flex-start`,
  gap: `1rem`,
})

const cardStyle = makeStyle({
  width: `10rem`,
  height: `5rem`,
})

function isLastChild (element: Element) {
  return element.parentElement!.lastElementChild === element
}
