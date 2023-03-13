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
import CardPhysics from '../game/CardPhysics'

export default class Zone extends GameComponent {
  private background = document.createElement('div')
  private cardContainer = document.createElement('div')

  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardToObject = new WeakMap<ObjectCard, GameObject>()
  private zoneEvents: Effect

  private cardPhysics = new CardPhysics(this.objectToCard, () => {
    this.updateCards()
    this.updateBackgroundSize()
  })

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
    requestAnimationFrame(() => this.cardPhysics.simulate())
  }

  private get scale () {
    // If map is zoomed out, the zone is transform scaled down.
    // Element.boundingClientRect() calculations need that scale applied
    return this.background.getBoundingClientRect().width
        / this.background.offsetWidth
  }

  private makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

    this.cardToObject.set(card, object)

    card.element.classList.add(cardStyle)

    this.translateCard(object, card)

    this.makeCardDraggable(object, card)

    this.cardContainer.append(card.element)

    return card
  }

  private makeCardDraggable (object: GameObject, card: ObjectCard) {
    let relX = 0
    let relY = 0

    makeDraggable(card.element, {
      onDown: (e) => {
        const { left, top, width, height }
            = card.element.getBoundingClientRect()

        relX = (e.clientX - left - width / 2) / this.scale
        relY = (e.clientY - top - height / 2) / this.scale

        this.cardPhysics.ignore(object, true)

        this.cardContainer.append(card.element)
      },
      onDrag: (e) => {
        const parentBBox = this.cardContainer.getBoundingClientRect()
        object.position.x = (e.clientX - parentBBox.left) / this.scale - relX
        object.position.y = (e.clientY - parentBBox.top) / this.scale - relY
        this.translateCard(object, card)
        this.updateBackgroundSize()
      },
      onUp: () => {
        this.cardPhysics.ignore(object, false)
        this.cardPhysics.simulate()
      },
    })
  }

  private translateCard (object: GameObject, card: ObjectCard) {
    const t = translate(object.position.x, object.position.y)
    card.element.style.transform = `${t} translate(-50%,-50%)`
  }

  private updateCards () {
    for (const [object, card] of this.objectToCard) {
      this.translateCard(object, card)
    }
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

    for (const [object, card] of this.objectToCard) {
      const x = object.position.x
      const y = object.position.y
      width = Math.max(width, Math.abs(x) + card.element.offsetWidth / 2)
      height = Math.max(height, Math.abs(y) + card.element.offsetHeight / 2)
    }

    this.background.style.width = numToPx(width * 2)
    this.background.style.height = numToPx(height * 2)
    this.background.style.transform = translate(-width, -height)
  }
}

const containerStyle = makeStyle({
  position: `absolute`,
  cursor: `pointer`,
})

const backgroundStyle = makeStyle({
  position: `absolute`,
  background: mapNodeColor,
  border,
  borderRadius,
  boxShadow,
  minWidth: `2rem`,
  minHeight: `2rem`,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})