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

export default class Zone extends Component {
  private objsToCard = new Map<GameObject, ObjectCard>()
  private zone!: HTMLElement
  private spots: HTMLElement[] = []

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

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'enter', ({item}) => {
          if (!isPlayer(item)) {
            changes.push(() => self.objectEnter(item))
          }
        })
        this.onEvent(this.object.container, 'leave', ({item}) => {
          if (item === this.object) {
            changes.push(() => self.playerMoveZone())
            this.reactivate()
          } else {
            changes.push(() => self.objectLeave(item))
          }
        })
        this.onEvent(this.object.container, 'moveSpot', ({item, from, to}) => {
          changes.push(() => self.moveSpot(item, from, to))
        })
        this.onEvent(this.object.container, 'itemActionStart', ({action}) => {
          const fn = () => self.objsToCard.get(action.object)!.setAction(action)
          if (!tickInEffect && action.object === game.player) {
            // If player starts a new action,
            // show action immediately even if outside of tick.
            fn()
          } else {
            changes.push(fn)
          }
        })
        this.onEvent(this.object.container, 'itemActionEnd', ({action}) => {
          changes.push(() => self.finishAction(action))
        })
      }
    }, game.player)

    this.makeZoneSpots()
  }

  private makeZoneSpots() {
    this.objsToCard.clear()

    this.zone = $('div', style.zone)
    this.element.append(this.zone)

    const container = game.player.container

    this.spots = []
    for (let i = 0; i < container.numSpots; i++) {

      const clickSpot = $('div', style.clickSpot)

      const spot = $('div', style.spot, [clickSpot])

      clickSpot.addEventListener('click', (e) => {
        startPlayerBehavior(new MovePlayerToSpot(game.player, i))
      })

      this.spots.push(spot)
      this.zone.append(spot)
    }

    for (const obj of container.contains) {
      this.createCard(obj)
    }
  }

  private animateChanges(changes: (() => void)[]) {
    let delay = 0
    let time = 1000 / changes.length
    for (const change of changes) {
      setTimeout(change, delay)
      delay += time
    }
  }

  private createCard(obj: GameObject) {
    const card = this.newComponent(ObjectCard, obj)
    this.spots[obj.spot].append(card.element)
    this.objsToCard.set(obj, card)
    return card
  }

  private finishAction(action: Action) {
    this.objsToCard.get(action.object)!.clearAction()
  }

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToCard.get(obj)!.element

    const oldBBox = elem.getBoundingClientRect()
    removeElementFromList(elem, (child, oldBBox, newBBox) => {
      child.animate([
        {transform: bBoxDiff(oldBBox, newBBox)},
        {transform: `translate(0, 0)`},
      ], {
        duration: 500,
        easing: 'ease-in-out',
        composite: 'accumulate',
      })
    })

    this.spots[to].append(elem)
    const newBBox = elem.getBoundingClientRect()
    elem.animate([
      {transform: bBoxDiff(oldBBox, newBBox)},
      {transform: `translate(0, 0)`},
    ], {
      duration: 500,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })
  }

  private objectEnter(obj: GameObject) {
    const elem = this.createCard(obj).element
    elem.animate([
      {opacity: 0, transform: `translate(0, 200%)`},
      {opacity: 1, transform: `translate(0, 0)`},
    ], {
      easing: 'ease-in-out',
      duration: 500,
    })
  }

  private objectLeave(obj: GameObject) {
    const card = this.objsToCard.get(obj)!
    const elem = card.element
    elem.style.zIndex = '999'
    elem.animate({
      opacity: 0,
      transform: 'translate(0, 200%)',
    }, {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'forwards',
    }).onfinish = () => {
      removeElementFromList(elem, (child, oldBBox, newBBox) => {
        child.animate([
          {transform: bBoxDiff(oldBBox, newBBox)},
          {transform: `translate(0, 0)`},
        ], {
          duration: 500,
          easing: 'ease-in-out',
          composite: 'accumulate',
        })
      })
      card.remove()
      this.objsToCard.delete(obj)
    }
  }

  private playerMoveZone() {
    const oldZone = this.zone
    const oldCards = [...this.objsToCard.values()]
    const oldPlayer = this.objsToCard.get(game.player)!.element
    const oldPlayerBBox = oldPlayer.getBoundingClientRect()

    this.makeZoneSpots()

    const newPlayer = this.objsToCard.get(game.player)!.element
    const newPlayerBBox = newPlayer.getBoundingClientRect()

    oldZone.animate({
      opacity: 0,
    }, {
      duration: 500,
      easing: 'linear',
    }).onfinish = () => {
      oldZone.remove()
      for (const card of oldCards) {
        card.remove()
      }
    }

    const fadeInOptions = {
      duration: 500,
      delay: 750,
      easing: 'linear',
    }

    for (const spot of this.spots) {
      animateWithDelay(spot, [
            {borderColor: 'transparent'},
            {borderColor: 'var(--borderColor)'}],
          fadeInOptions)
    }

    for (const card of this.objsToCard.values()) {
      if (card.element !== newPlayer) {
        animateWithDelay(card.element, [{opacity: 0}, {opacity: 1}],
            fadeInOptions)
      }
    }

    oldPlayer.style.opacity = '0'
    animateWithDelay(newPlayer,
        [
          {
            transform: bBoxDiff(oldPlayerBBox, newPlayerBBox),
            width: `${oldPlayerBBox.width}px`,
          },
          {transform: `translate(0, 0)`, width: `${newPlayerBBox.width}px`}],
        {
          delay: 500,
          duration: 1000,
          easing: 'ease-in-out',
        })
  }
}

function bBoxDiff(oldBBox: DOMRect, newBBox: DOMRect) {
  return `translate(${oldBBox.x - newBBox.x}px, ${oldBBox.y - newBBox.y}px)`
}
