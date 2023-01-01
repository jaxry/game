import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import { MovePlayerToSpot } from '../../behavior/player'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, numToPx } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import { outsideElem } from './App'

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
          self.objectEnter(item)
        })
        this.onEvent(this.object, 'leave', ({ item }) => {
          self.objectLeave(item)
        })
        this.onEvent(this.object, 'moveSpot', ({ item, from, to }) => {
          self.moveSpot(item, from, to)
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
      this.makeCard(obj, false)
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

  private makeCard (obj: GameObject, animate = true) {
    let card = this.objectToCard.get(obj)

    if (!card) {
      card = this.newComponent(ObjectCard, obj)
      this.objectToCard.set(obj, card)
    }

    if (animate) {
      this.addCardToSpot(card.element, obj.spot)
    } else {
      this.spots[obj.spot].append(card.element)
    }

    return card
  }

  private addCardToSpot (card: Element, spotIndex: number) {
    this.spots[spotIndex].append(card)

    const { width, height, margin } = getComputedStyle(card)

    const empty = document.createElement('div')
    card.replaceWith(empty)

    empty.animate({
      height: [`0`, height],
      width: [`0`, width],
      margin: [`0`, margin],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      empty.replaceWith(card)
    }
  }

  private removeCardFromSpot (card: Element) {
    const { width, height, margin } = getComputedStyle(card)
    const empty = document.createElement('div')
    card.replaceWith(empty)
    empty.animate({
      height: [height, `0`],
      width: [width, `0`],
      margin: [margin, `0`],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      empty.remove()
    }
  }

  private moveSpot (obj: GameObject, from: number, to: number) {
    const elem = this.objectToCard.get(obj)!.element

    const { width, height, margin } = getComputedStyle(elem)
    const fromBBox = elem.getBoundingClientRect()

    const emptyFrom = document.createElement('div')
    elem.replaceWith(emptyFrom)

    const emptyTo = document.createElement('div')
    this.spots[to].append(emptyTo)

    emptyFrom.style.margin = `0`
    emptyTo.style.width = width
    emptyTo.style.height = height
    emptyTo.style.margin = margin

    const toBBox = emptyTo.getBoundingClientRect()

    emptyFrom.animate({
      height: [height, `0`],
      width: [width, `0`],
      margin: [margin, `0`],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      emptyFrom.remove()
    }

    emptyTo.animate({
      height: [`0`, height],
      width: [`0`, width],
      margin: [`0`, margin],
    }, {
      duration: duration.fast,
      easing: 'ease-in-out',
      fill: 'forwards',
    })

    outsideElem.append(elem)
    elem.animate({
      transform: [
          `translate(${numToPx(fromBBox.x)}, ${numToPx(fromBBox.y)}`,
          `translate(${numToPx(toBBox.x)}, ${numToPx(toBBox.y)})`,
      ],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      emptyTo.replaceWith(elem)
    }
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
  borderRight: `1px dashed ${borderColor}`,
  padding: `0.5rem`,
  paddingBottom: `1rem`,
  cursor: `pointer`,
  transition: `width ${duration.normal}ms ease-in-out`,
})

makeStyle(`.${spotStyle} > *`, {
  margin: `0.25rem 0`,
})
makeStyle(`.${spotStyle} > *`, {
  cursor: `default`,
})
makeStyle(`.${spotStyle}:last-child`, {
  borderRight: `none`,
})