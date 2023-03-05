import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { clamp, getAndDelete, makeOrGet, translate } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import Position from '../../Position'
import { outsideElem } from './App'

export default class Zone extends GameComponent {
  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardData = new WeakMap<ObjectCard, {
    object: GameObject,
    position: Position
  }>()
  private zoneEvents: Effect

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'enter', ({ item }) => {
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

  private makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

    const position = new Position(Math.random() * 250, Math.random() * 250)

    this.cardData.set(card, { object, position })

    card.element.classList.add(cardStyle)
    card.element.style.transform = translate(position.x, position.y)

    this.element.append(card.element)

    makeDraggable(card.element, {
      onDown: (e) => {
        const { left, top } = card.element.getBoundingClientRect()
        const relX = e.clientX - left
        const relY = e.clientY - top

        outsideElem.append(card.element)

        card.element.style.transform = translate(
            e.clientX - relX, e.clientY - relY)

        return (e) => {
          card.element.style.transform = translate(
              e.clientX - relX, e.clientY - relY)
        }
      },
      onUp: () => {
        const parentBBox = this.element.getBoundingClientRect()
        const cardBBox = card.element.getBoundingClientRect()
        const x = clamp(0, this.element.offsetWidth,
            cardBBox.left - parentBBox.left)
        const y = clamp(0, this.element.offsetHeight,
            cardBBox.top - parentBBox.top)
        this.element.append(card.element)
        card.element.style.transform = translate(x, y)
      },
    })

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