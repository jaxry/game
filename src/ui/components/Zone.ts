import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, makeOrGet, numToPx, translate } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import { border, borderRadius, boxShadow, mapNodeColor } from '../theme'

export default class Zone extends GameComponent {
  private background = document.createElement('div')
  private cardContainer = document.createElement('div')

  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardToObject = new WeakMap<ObjectCard, GameObject>()
  private zoneEvents: Effect

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    this.background.classList.add(backgroundStyle)
    this.element.append(this.background)

    this.element.append(this.cardContainer)

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
    requestAnimationFrame(() => {
      this.updateBackgroundSize()
    })
  }

  private get scale () {
    return this.background.offsetWidth
        / this.background.getBoundingClientRect().width
  }

  private makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

    this.cardToObject.set(card, object)

    card.element.classList.add(cardStyle)

    this.cardContainer.append(card.element)

    this.makeCardDraggable(card)

    return card
  }

  private makeCardDraggable (card: ObjectCard) {
    let relX: number
    let relY: number
    makeDraggable(card.element, {
      onDown: (e) => {
        const { left, top } = card.element.getBoundingClientRect()

        relX = (e.clientX - left) * this.scale
        relY = (e.clientY - top) * this.scale

        this.cardContainer.append(card.element)
      },
      onDrag: (e) => {
        const parentBBox = this.cardContainer.getBoundingClientRect()
        const x = (e.clientX - parentBBox.left) * this.scale - relX
        const y = (e.clientY - parentBBox.top) * this.scale - relY
        card.element.style.transform = translate(x, y)
        this.updateBackgroundSize()
      }
    })
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)
    // card.enter()
    this.updateBackgroundSize()
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.remove()
    // card.exit()
    this.updateBackgroundSize()
  }

  private updateBackgroundSize () {
    let width = 16
    let height = 16

    const { left, top } = this.cardContainer.getBoundingClientRect()
    for (const card of this.objectToCard.values()) {
      const { x, y } = card.element.getBoundingClientRect()
      const relX = (x - left) * this.scale
      const relY = (y - top) * this.scale
      width = Math.max(width, -relX, relX + card.element.offsetWidth)
      height = Math.max(height, -relY, relY + card.element.offsetHeight)
    }

    this.background.style.width = numToPx(width * 2)
    this.background.style.height = numToPx(height * 2)
    this.background.style.transform = translate(-width, -height)
  }
}

const containerStyle = makeStyle({
  position: `absolute`,
  minWidth: `2rem`,
  minHeight: `2rem`,
  cursor: `pointer`,
})

const backgroundStyle = makeStyle({
  position: `absolute`,
  background: mapNodeColor,
  border,
  borderRadius,
  boxShadow,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})