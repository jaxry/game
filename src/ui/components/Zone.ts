import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import { MovePlayerToSpot } from '../../behavior/player'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, translate } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import { outsideElem } from './App'
import DummyElement from '../DummyElement'

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

    this.spots[obj.spot].append(card.element)

    return card
  }

  private moveSpot (obj: GameObject, from: number, to: number) {
    const elem = this.objectToCard.get(obj)!.element
    const fromBBox = elem.getBoundingClientRect()
    const dummyFrom = new DummyElement(elem)

    this.spots[to].append(elem)
    const toBBox = elem.getBoundingClientRect()
    const dummyTo = new DummyElement(elem)

    dummyFrom.shrink({
      duration: duration.slow,
    })

    dummyTo.grow()

    outsideElem.append(elem)
    elem.animate({
      transform: [
        translate(fromBBox.x, fromBBox.y), translate(toBBox.x, toBBox.y)],
    }, {
      duration: duration.slow,
      easing: 'ease-in-out',
    }).onfinish = () => {
      dummyTo.element.replaceWith(elem)
    }
  }

  private objectEnter (obj: GameObject) {

    const card = this.makeCard(obj)

    const bbox = card.element.getBoundingClientRect()

    const dummy = new DummyElement(card.element)
    dummy.grow()

    outsideElem.append(card.element)
    card.element.animate([
      { opacity: 0, transform: translate(bbox.x, bbox.y + bbox.height) },
      { opacity: 1, transform: translate(bbox.x, bbox.y) },
    ], {
      easing: 'ease-in-out',
      duration: duration.slow,
    }).onfinish = () => {
      dummy.element.replaceWith(card.element)
    }
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!

    const bbox = card.element.getBoundingClientRect()

    const dummy = new DummyElement(card.element)
    dummy.shrink()

    outsideElem.append(card.element)
    card.element.animate([
      { opacity: 1, transform: translate(bbox.x, bbox.y) },
      { opacity: 0, transform: translate(bbox.x, bbox.y + bbox.height) },
    ], {
      easing: 'ease-in-out',
      duration: duration.slow,
    }).onfinish = () => {
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