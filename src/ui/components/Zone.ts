import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import { isPlayer, MovePlayerToSpot } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import ObjectCard from './ObjectCard'
import { startPlayerBehavior } from '../../behavior/core'
import animationDuration from '../animationDuration'
import bBoxDiff from '../bBoxDiff'
import { removeElemAndAnimateList } from '../removeElementFromList'
import { getAndDelete } from '../../util'
import { staggerStateChange } from './Game'

export default class Zone extends Component {
  private objsToCard = new Map<GameObject, ObjectCard>()
  private spots: HTMLElement[] = []
  private zoneEvents: Effect

  constructor() {
    super()

    this.element.classList.add(style.container)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      onActivate() {
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

  private makeZoneSpots() {
    const container = game.player.container

    this.spots.length = 0
    for (let i = 0; i < container.numSpots; i++) {

      const spot = $('div', style.spot)

      spot.addEventListener('click', (e) => {
        // only click if not clicked on a child element
        if (e.target === e.currentTarget) {
          startPlayerBehavior(new MovePlayerToSpot(game.player, i))
        }
      })

      this.spots.push(spot)
      this.element.append(spot)
    }

    for (const obj of container.contains) {
      this.createCard(obj)
    }
  }

  private createCard(obj: GameObject) {
    let card = this.objsToCard.get(obj)

    if (!card) {
      card = this.newComponent(ObjectCard, obj)
      this.objsToCard.set(obj, card)
    }

    this.spots[obj.spot].append(card.element)
    return card
  }

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToCard.get(obj)!.element

    const oldBBox = elem.getBoundingClientRect()

    removeElemAndAnimateList(elem)

    this.spots[to].append(elem)
    const newBBox = elem.getBoundingClientRect()
    elem.animate([
      { transform: bBoxDiff(oldBBox, newBBox) },
      { transform: `translate(0, 0)` },
    ], {
      duration: animationDuration.normal,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })
  }

  private objectEnter(obj: GameObject) {
    const elem = this.createCard(obj).element
    elem.animate([
      { opacity: 0, transform: `translate(0, 200%)` },
      { opacity: 1, transform: `translate(0, 0)` },
    ], {
      easing: 'ease-in-out',
      duration: animationDuration.normal,
    })
  }

  private objectLeave(obj: GameObject) {
    const card = getAndDelete(this.objsToCard, obj)!
    const elem = card.element
    elem.animate({
      opacity: 0,
      transform: `translate(0, 200%)`,
    }, {
      duration: animationDuration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      removeElemAndAnimateList(elem)
      card.remove()
    }
  }

  private playerMoveZone() {
    const fadeTime = animationDuration.normal

    for (const [obj, card] of this.objsToCard) {
      if (obj === game.player) {
        continue
      }
      card.element.animate({
        opacity: 0,
      }, {
        duration: fadeTime,
      }).onfinish = () => {
        card.remove()
        this.objsToCard.delete(obj)
      }
    }

    for (const spot of this.spots) {
      spot.animate({
        borderColor: 'transparent',
      }, {
        duration: fadeTime,
      })
    }

    const playerCard = this.objsToCard.get(game.player)!
    const playerBbox = playerCard.element.getBoundingClientRect()

    const animateNewZone = () => {
      this.spots.forEach(spot => spot.remove())
      this.makeZoneSpots()
      this.zoneEvents.reactivate()

      for (const card of this.objsToCard.values()) {
        if (card === playerCard) {
          continue
        }
        animateWithDelay(card.element, {
          opacity: [0, 1],
        }, {
          duration: fadeTime,
          delay: animationDuration.fast,
        })
      }

      for (const spot of this.spots) {
        animateWithDelay(spot, {
          borderColor: ['transparent', ''],
        }, {
          duration: fadeTime,
          delay: animationDuration.fast,
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