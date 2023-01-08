import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import { MovePlayerToSpot } from '../../behavior/player'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, makeOrGet, translate } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import DummyElement from '../DummyElement'
import { isAncestor } from '../../behavior/container'

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
      if (e.target !== spot) {
        return
      }
      if (isAncestor(this.zone, game.player)) {
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
    const card = makeOrGet(this.objectToCard, obj, () => {
      return this.newComponent(ObjectCard, obj)
    })

    this.spots[obj.spot].append(card.element)

    return card
  }

  private moveSpot (obj: GameObject, from: number, to: number) {
    const elem = this.objectToCard.get(obj)!.element

    const dummyTo = new DummyElement(elem, false)
    this.spots[to].append(dummyTo.element)

    const bboxFrom = elem.getBoundingClientRect()
    const bboxTo = dummyTo.element.getBoundingClientRect()

    dummyTo.grow()

    elem.animate({
      transform: [translate(bboxTo.x - bboxFrom.x, bboxTo.y - bboxFrom.y)],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      const dummyFrom = new DummyElement(elem)
      dummyTo.element.replaceWith(elem)
      dummyFrom.shrink()
    }
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)

    const dummy = new DummyElement(card.element)
    dummy.grow().onfinish = () => {
      dummy.element.replaceWith(card.element)
      card.element.animate([
        { opacity: 0, transform: translate(0, card.element.offsetHeight) },
        { opacity: 1, transform: translate(0, 0) },
      ], {
        easing: 'ease-out',
        duration: duration.normal,
      })
    }
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!

    card.element.animate([
      { opacity: 1, transform: translate(0, 0) },
      { opacity: 0, transform: translate(0, card.element.offsetHeight) },
    ], {
      easing: 'ease-in',
      duration: duration.normal,
    }).onfinish = () => {
      new DummyElement(card.element).shrink()
      card.remove()
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
})

const spotStyle = makeStyle({
  minWidth: `2rem`,
  display: `flex`,
  flexDirection: `column`,
  borderRight: `1px dashed ${borderColor}`,
  padding: `0.5rem`,
  paddingBottom: `1rem`,
  cursor: `pointer`,
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