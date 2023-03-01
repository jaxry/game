import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, makeOrGet } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'

export default class Zone extends GameComponent {
  private objectToCard = new Map<GameObject, ObjectCard>()
  private zoneEvents: Effect

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      override events () {        this.on(this.object, 'enter', ({ item }) => {
          self.objectEnter(item)
        })
        this.on(this.object, 'leave', ({ item }) => {
          self.objectLeave(item)
        })
      }
    }, zone)

    dragAndDropGameObject.drop(this.element, (item) => {
      if (new TransferAction(game.player, item, this.zone).condition()) {
        return 'move'
      }
    }, (item) => {
      setPlayerEffect(new TransferAction(game.player, item, this.zone))
    })

    for (const obj of this.zone.contains) {
      this.makeCard(obj)
    }
  }

  private makeCard (obj: GameObject) {
    const card = makeOrGet(this.objectToCard, obj, () =>
        this.newComponent(ObjectCard, obj))

    card.element.classList.add(cardStyle)
    card.element.style.transform =
        `translate(${Math.random() * 20}rem, ${Math.random() * 20}rem)`

    this.element.append(card.element)

    return card
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)
    // card.enter()
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.remove()
    // card.exit()
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  width: `20rem`,
  height: `20rem`,
  cursor: `pointer`,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})