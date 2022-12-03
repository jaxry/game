import Component from './Component'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import { isPlayer, MovePlayerToSpot } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import ObjectCard from './ObjectCard'
import { startPlayerEffect } from '../../behavior/core'
import bBoxDiff from '../bBoxDiff'
import { removeElemAndAnimateList } from '../removeElementFromList'
import { getAndDelete } from '../../util'
import { dragAndDropGameObject, staggerStateChange } from './GameUI'
import TransferAction from '../../actions/Transfer'
import { border, borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'

export default class Zone extends GameComponent {
  private objectToCard = new Map<GameObject, ObjectCard>()
  private spots: HTMLElement[] = []
  private zoneEvents: Effect

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      onActivate () {
        this.onEvent(this.object.container, 'enter', ({ item }) => {
          if (!isPlayer(item)) {
            staggerStateChange.add(() => self.objectEnter(item))
          }
        })
        this.onEvent(this.object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            staggerStateChange.add(() => self.playerMoveZone())
            self.zoneEvents.deactivate()
          } else {
            staggerStateChange.add(() => self.objectLeave(item))
          }
        })
        this.onEvent(this.object.container, 'moveSpot',
            ({ item, from, to }) => {
              staggerStateChange.add(() => self.moveSpot(item, from, to))
            })
      }
    }, game.player)

    this.makeZoneSpots()
  }

  private makeZoneSpots () {
    const container = game.player.container

    this.spots.length = 0
    for (let i = 0; i < container.numSpots; i++) {

      const spot = document.createElement('div')
      spot.classList.add(spotStyle)

      spot.addEventListener('click', (e) => {
        // only click if not clicked on a child element
        if (e.target === e.currentTarget) {
          startPlayerEffect(new MovePlayerToSpot(game.player, i))
        }
      })

      dragAndDropGameObject.drop(spot, (item) => {
        if (new TransferAction(game.player, item, container, i).condition()) {
          return 'move'
        }
      }, (item) => {
        startPlayerEffect(new TransferAction(game.player, item, container, i))
      })

      this.spots.push(spot)
      this.element.append(spot)
    }

    for (const obj of container.contains) {
      this.makeCard(obj)
    }
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

    const oldBBox = elem.getBoundingClientRect()

    removeElemAndAnimateList(elem)

    this.spots[to].append(elem)
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
      removeElemAndAnimateList(elem)
      card.remove()
    }
  }

  private playerMoveZone () {
    const fadeTime = duration.normal

    for (const [obj, card] of this.objectToCard) {
      if (obj === game.player) {
        continue
      }
      card.element.animate({
        opacity: 0,
      }, {
        duration: fadeTime,
      }).onfinish = () => {
        card.remove()
        this.objectToCard.delete(obj)
      }
    }

    for (const spot of this.spots) {
      spot.animate({
        borderColor: 'transparent',
      }, {
        duration: fadeTime,
      })
    }

    const playerCard = this.objectToCard.get(game.player)!
    const playerBbox = playerCard.element.getBoundingClientRect()

    const animateNewZone = () => {
      this.spots.forEach(spot => spot.remove())
      this.makeZoneSpots()
      this.zoneEvents.reactivate()

      for (const card of this.objectToCard.values()) {
        if (card === playerCard) {
          continue
        }
        animateWithDelay(card.element, {
          opacity: [0, 1],
        }, {
          duration: fadeTime,
          delay: duration.fast,
        })
      }

      for (const spot of this.spots) {
        animateWithDelay(spot, {
          borderColor: ['transparent', ''],
        }, {
          duration: fadeTime,
          delay: duration.fast,
        })
      }

      playerCard.element.animate({
        transform: [
          bBoxDiff(playerBbox, playerCard.element.getBoundingClientRect()),
          'translate(0, 0)'],
      }, {
        duration: fadeTime,
        easing: 'ease-in-out',
      })
    }

    setTimeout(animateNewZone, fadeTime)
  }
}

const containerStyle = makeStyle({
  display: `grid`,
  gridAutoColumns: `minmax(10rem, calc(100% / 8))`,
  gridAutoFlow: `column`,
  justifyContent: `center`,
  width: `100%`,
  height: `100%`,
  overflow: `auto`,
})

const spotStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  gap: `1rem`,
  borderRight: `1px dashed ${borderColor}`,
  padding: `0.5rem`,
  cursor: `pointer`,
})
makeStyle(`.${spotStyle} > *`, {
  cursor: `default`,
})
makeStyle(`.${spotStyle}:first-child`, {
  borderLeft: border,
})
makeStyle(`.${spotStyle}:last-child`, {
  borderRight: border,
})