import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import { isPlayer, MovePlayerToSpot } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import bBoxDiff from '../bBoxDiff'
import { removeElemAndAnimateList } from '../removeElementFromList'
import { getAndDelete } from '../../util'
import { dragAndDropGameObject, staggerStateChange } from './GameUI'
import { border, borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'

export default class Zone extends GameComponent {
  private objectToCard = new Map<GameObject, ObjectCard>()
  private spots: HTMLElement[] = []
  private zoneEvents: Effect

  constructor (public following: GameObject = game.player) {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      override registerEvents () {
        this.onEvent(this.object, 'enter', ({ item }) => {
          if (!isPlayer(item)) {
            staggerStateChange.add(() => self.objectEnter(item))
          }
        })
        this.onEvent(this.object, 'leave', ({ item }) => {
          if (item === self.following) {
            this.deactivate()
            staggerStateChange.add(() => self.followObject(self.following))
          } else {
            staggerStateChange.add(() => self.objectLeave(item))
          }
        })
        this.onEvent(this.object, 'moveSpot',
            ({ item, from, to }) => {
              staggerStateChange.add(() => self.moveSpot(item, from, to))
            })
      }
    }, this.following.container)

    this.makeZoneSpots()
  }

  moveZones (zone: GameObject) {
    this.zoneEvents.setObject(zone)

    this.element.animate({
      opacity: 0,
    }, {
      duration: duration.normal,
      fill: 'forwards',
    }).onfinish = () => {
      this.makeZoneSpots()
      this.element.animate({
        opacity: 1,
      }, {
        duration: duration.normal,
        fill: 'forwards',
      })
    }
  }

  private makeZoneSpots () {
    const zone = this.zoneEvents.object

    for (const card of this.objectToCard.values()) {
      card.remove()
    }
    this.objectToCard.clear()

    this.spots.forEach(spot => spot.remove())
    this.spots.length = 0

    for (let i = 0; i < zone.numSpots; i++) {

      const spot = document.createElement('div')
      spot.classList.add(spotStyle)

      spot.addEventListener('click', (e) => {
        // only click if not clicked on a child element
        if (e.target === e.currentTarget) {
          setPlayerEffect(new MovePlayerToSpot(game.player, i))
        }
      })

      dragAndDropGameObject.drop(spot, (item) => {
        if (new TransferAction(game.player, item, zone, i).condition()) {
          return 'move'
        }
      }, (item) => {
        setPlayerEffect(new TransferAction(game.player, item, zone, i))
      })

      this.spots.push(spot)
      this.element.append(spot)
    }

    for (const obj of zone.contains) {
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

  private followObject (following: GameObject) {
    const fadeTime = duration.normal

    for (const [obj, card] of this.objectToCard) {
      if (obj === following) {
        continue
      }
      card.element.animate({
        opacity: 0,
      }, {
        fill: 'forwards',
        duration: fadeTime,
      })
    }

    for (const spot of this.spots) {
      spot.animate({
        borderColor: 'transparent',
      }, {
        fill: 'forwards',
        duration: fadeTime,
      })
    }

    let followingCard = this.objectToCard.get(following)!
    const followingBBox = followingCard.element.getBoundingClientRect()

    const animateNewZone = () => {
      this.zoneEvents.setObject(following.container)
      this.makeZoneSpots()

      for (const card of this.objectToCard.values()) {
        if (card.object === followingCard.object) {
          followingCard = card
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

      followingCard.element.animate({
        transform: [
          bBoxDiff(followingBBox,
              followingCard.element.getBoundingClientRect()),
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
  display: `flex`,
  justifyContent: `center`,
  overflow: `auto`,
})

const spotStyle = makeStyle({
  flex: `0 0 max(10rem, calc(100% / 8))`,
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