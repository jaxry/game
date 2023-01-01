import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import { MovePlayerToSpot } from '../../behavior/player'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import bBoxDiff from '../bBoxDiff'
import { removeElemAndAnimateList } from '../removeElementFromList'
import { getAndDelete, numToPx } from '../../util'
import { dragAndDropGameObject, staggerStateChange } from './GameUI'
import { borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'

export default class Zone extends GameComponent {
  private objectToCard = new Map<GameObject, ObjectCard>()
  private spots: HTMLElement[] = []
  private zoneEvents: Effect

  constructor (public zone: GameObject, public following?: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      override registerEvents () {
        this.onEvent(this.object, 'enter', ({ item }) => {
          staggerStateChange.add(() => self.objectEnter(item))
        })
        this.onEvent(this.object, 'leave', ({ item }) => {
          staggerStateChange.add(() => self.objectLeave(item))
        })
        this.onEvent(this.object, 'moveSpot',
            ({ item, from, to }) => {
              staggerStateChange.add(() => self.moveSpot(item, from, to))
            })
      }
    }, zone)

    this.populateZone()
  }

  private populateZone () {
    this.clearZone()

    for (let i = 0; i < this.zone.numSpots; i++) {
      this.makeSpot(i)
    }

    for (const obj of this.zone.contains) {
      this.makeCard(obj)
    }
  }

  private clearZone () {
    for (const card of this.objectToCard.values()) {
      card.remove()
    }
    this.objectToCard.clear()

    this.spots.forEach(spot => spot.remove())
    this.spots.length = 0
  }

  private makeSpot (i: number) {
    const spot = document.createElement('div')
    spot.classList.add(spotStyle)

    spot.addEventListener('click', (e) => {
      // only click if not clicked on a child element
      if (e.target === e.currentTarget) {
        setPlayerEffect(new MovePlayerToSpot(game.player, i))
      }
    })

    dragAndDropGameObject.drop(spot, (item) => {
      if (new TransferAction(game.player, item, this.zone, i).condition()) {
        return 'move'
      }
    }, (item) => {
      setPlayerEffect(new TransferAction(game.player, item, this.zone, i))
    })

    this.spots.push(spot)
    this.element.append(spot)
  }

  private makeCard (obj: GameObject) {
    let card = this.objectToCard.get(obj)

    if (!card) {
      card = this.newComponent(ObjectCard, obj)
      this.objectToCard.set(obj, card)
    }

    this.addCardToSpot(card.element, obj.spot)

    return card
  }

  // todo: Animate container height
  // possibly abstract old to new animation code
  private addCardToSpot (card: Element, spotIndex: number) {
    const spot = this.spots[spotIndex]
    const oldWidth = spot.getBoundingClientRect().width
    spot.append(card)
    const newWidth = spot.getBoundingClientRect().width
    if (oldWidth !== newWidth) {
      spot.animate({
        width: [numToPx(oldWidth), numToPx(newWidth)],
      }, {
        duration: duration.fast,
        easing: 'ease-in-out',
      })
    }
  }

  private removeCardFromSpot (card: Element) {
    const spot = card.parentElement!
    const oldWidth = spot.getBoundingClientRect().width
    removeElemAndAnimateList(card)
    const newWidth = spot.getBoundingClientRect().width
    if (oldWidth !== newWidth) {
      spot.animate({
        width: [numToPx(oldWidth), numToPx(newWidth)],
      }, {
        duration: duration.fast,
        easing: 'ease-in-out',
      })
    }
  }

  private moveSpot (obj: GameObject, from: number, to: number) {
    const elem = this.objectToCard.get(obj)!.element

    const oldBBox = elem.getBoundingClientRect()

    this.removeCardFromSpot(elem)
    this.addCardToSpot(elem, to)

    const newBBox = elem.getBoundingClientRect()
    elem.animate([
      { transform: bBoxDiff(oldBBox, newBBox) },
      { transform: `translate(0, 0)` },
    ], {
      duration: duration.normal,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })
  }

  private objectEnter (obj: GameObject) {
    const elem = this.makeCard(obj).element
    elem.animate([
      { opacity: 0, transform: `translate(0, 200%)` },
      { opacity: 1, transform: `translate(0, 0)` },
    ], {
      easing: 'ease-in-out',
      duration: duration.normal,
    })
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    const elem = card.element
    elem.animate({
      opacity: 0,
      transform: `translate(0, 200%)`,
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      this.removeCardFromSpot(elem)
      card.remove()
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  // justifyContent: `center`,
  // overflow: `auto`,
})

const spotStyle = makeStyle({
  minWidth: `1.5rem`,
  display: `flex`,
  flexDirection: `column`,
  gap: `1rem`,
  borderRight: `1px dashed ${borderColor}`,
  padding: `0.5rem`,
  paddingBottom: `1rem`,
  cursor: `pointer`,
  transition: `width ${duration.normal}ms ease-in-out`,
})

makeStyle(`.${spotStyle} > *`, {
  width: `8rem`,
})
makeStyle(`.${spotStyle} > *`, {
  cursor: `default`,
})
makeStyle(`.${spotStyle}:last-child`, {
  borderRight: `none`,
})