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
        this.on(this.object, 'moveSpot', ({ item, from, to }) => {
          self.moveSpot(item, from, to)
        })
      }
    }, zone)

    this.populateZone()
  }

  private populateZone () {
    for (let i = 0; i < this.zone.numSpots; i++) {
      this.makeSpot(i)
    }

    for (const obj of this.zone.contains) {
      this.makeCard(obj)
    }
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
    const card = makeOrGet(this.objectToCard, obj, () =>
        this.newComponent(ObjectCard, obj))

    this.spots[obj.spot].append(card.element)

    return card
  }

  private moveSpot (obj: GameObject, from: number, to: number) {
    const elem = this.objectToCard.get(obj)!.element

    const bboxFrom = elem.getBoundingClientRect()

    const dummyTo = new DummyElement(elem, false)
    this.spots[to].append(dummyTo.element)

    const bboxTo = dummyTo.element.getBoundingClientRect()

    new DummyElement(elem).shrink()

    dummyTo.element.append(elem)
    dummyTo.grow()

    elem.animate({
      transform: [
        translate(bboxFrom.x - bboxTo.x, bboxFrom.y - bboxTo.y),
        translate(0, 0)],
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    })
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)
    card.enter()
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.exit()
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