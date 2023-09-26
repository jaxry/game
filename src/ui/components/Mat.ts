import Entity from '../../Entity.ts'
import Component from '../../util/Component.ts'
import { entityChildren } from '../../logic/container.ts'
import { componentEffect } from '../componentEffect.ts'
import Effect from '../../effects/Effect.ts'
import { getAndDelete, makeOrGet } from '../../util/util.ts'
import EntityCard from './EntityCard.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import CardPhysics from '../CardPhysics.ts'

export default class Mat extends Component {
  entityToCard = new Map<Entity, EntityCard>()
  cardPhysics = new CardPhysics()

  constructor (public container: Entity) {
    super()
  }

  override onInit () {
    this.style(containerStyle)

    entityChildren(this.container, (child) => {
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
    }).activate(this.container)
  }

  addEntity (entity: Entity) {
    const card = makeOrGet(this.entityToCard, entity, () => {
      return this.newComponent(EntityCard, entity)
          .style(cardStyle)
          .appendTo(this.element)
    })

    this.cardPhysics.addCard(card)
  }

  removeEntity (entity: Entity) {
    const card = getAndDelete(this.entityToCard, entity)!
    this.cardPhysics.removeCard(card)
    card.remove()
  }
}

const containerStyle = makeStyle({
  position: `relative`,
})

const cardStyle = makeStyle({
  position: 'absolute',
  width: `8rem`,
  height: `4rem`,
})