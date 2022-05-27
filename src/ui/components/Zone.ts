import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import { isPlayer, MovePlayerToSpot } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import removeElementFromList from '../removeElementFromList'
import ObjectCard from './ObjectCard'
import { startPlayerBehavior } from '../../behavior/core'
import Action from '../../behavior/Action'
import TargetActionAnimation from './TargetActionAnimation'
import animationDuration from '../animationDuration'

export default class Zone extends Component {
  private objsToCard = new Map<GameObject, ObjectCard>()
  private spots: HTMLElement[] = []
  private zoneEvents: Effect

  constructor() {
    super()

    this.element.classList.add(style.container)

    const self = this

    const changes: (() => void)[] = []

    let tickInEffect = false

    this.on(game.event.playerTickStart, () => {
      tickInEffect = true
    })

    this.on(game.event.playerTickEnd, () => {
      for (const card of this.objsToCard.values()) {
        card.update()
      }
      if (changes.length > 0) {
        this.animateChanges(changes)
        changes.length = 0
      }
      tickInEffect = false
    })

    this.zoneEvents = this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'enter', ({ item }) => {
          if (!isPlayer(item)) {
            changes.push(() => self.objectEnter(item))
          }
        })
        this.onEvent(this.object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            changes.push(() => self.playerMoveZone())
            self.zoneEvents.deactivate()
          } else {
            changes.push(() => self.objectLeave(item))
          }
        })
        this.onEvent(this.object.container, 'moveSpot',
            ({ item, from, to }) => {
              changes.push(() => self.moveSpot(item, from, to))
            })
        this.onEvent(this.object.container, 'itemActionStart', ({ action }) => {
          const fn = () => self.objsToCard.get(action.object)!.setAction(action)

          // If player starts a new action,
          // show action immediately even if outside of tick.
          if (!tickInEffect && action.object === game.player) {
            fn()
          } else {
            changes.push(fn)
          }
        })
        this.onEvent(this.object.container, 'itemActionEnd', ({ action }) => {
          changes.push(() => self.finishAction(action))
        })
      }
    }, game.player)

    this.makeZoneSpots()
  }

  private animateChanges(changes: (() => void)[]) {
    let delay = 0
    let time = 1000 / changes.length
    for (const change of changes) {
      setTimeout(change, delay)
      delay += time
    }
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

  private finishAction(action: Action) {
    const card = this.objsToCard.get(action.object)!
    card.clearAction()
    if (action.target && this.objsToCard.has(action.target)) {
      const to = this.objsToCard.get(action.target)!.element
      this.newComponent(TargetActionAnimation, action, card.element, to)
    }
  }

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToCard.get(obj)!.element

    const oldBBox = elem.getBoundingClientRect()
    removeElementFromList(elem, (child, oldBBox, newBBox) => {
      child.animate([
        { transform: bBoxDiff(oldBBox, newBBox) },
        { transform: `translate(0, 0)` },
      ], {
        duration: animationDuration.normal,
        easing: 'ease-in-out',
        composite: 'accumulate',
      })
    })

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
    const card = this.objsToCard.get(obj)!
    const elem = card.element
    elem.style.zIndex = '1'
    elem.animate({
      opacity: 0,
      // transform: 'translate(0, 200%)',
    }, {
      duration: animationDuration.normal,
      easing: 'ease-in-out',
      fill: 'forwards',
    }).onfinish = () => {
      removeElementFromList(elem, (child, oldBBox, newBBox) => {
        child.animate([
          { transform: bBoxDiff(oldBBox, newBBox) },
          { transform: `translate(0, 0)` },
        ], {
          duration: animationDuration.normal,
          easing: 'ease-in-out',
          composite: 'accumulate',
        })
      })
      card.remove()
      this.objsToCard.delete(obj)
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
          borderColor: ['transparent', 'var(--borderColorDarker)'],
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

function bBoxDiff(oldBBox: DOMRect, newBBox: DOMRect) {
  return `translate(${oldBBox.x - newBBox.x}px, ${oldBBox.y - newBBox.y}px)`
}
