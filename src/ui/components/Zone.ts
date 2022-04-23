import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import { isPlayer } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import removeElementFromList from '../removeElementFromList'
import ObjectCard from './ObjectCard'

export default class Zone extends Component {
  private objsToCard = new Map<GameObject, ObjectCard>()
  private zone!: HTMLElement
  private spots: HTMLElement[] = []
  private changes: (() => void)[] = []

  constructor() {
    super()

    this.element.classList.add(style.container)

    this.populateZone()

    const self = this

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'enter', ({item}) => {
          if (!isPlayer(item)) {
            self.changes.push(() => self.objectEnter(item))
          }
        })
        this.onEvent(this.object.container, 'leave', ({item}) => {
          if (item === this.object) {
            self.changes.push(() => self.playerMoveZone())
            this.reactivate()
          } else {
            self.changes.push(() => self.objectLeave(item))
          }
        })
        this.onEvent(this.object.container, 'moveSpot', ({item, from, to}) => {
          self.changes.push(() => self.moveSpot(item, from, to))
        })
        this.onEvent(this.object.container, 'itemActionStart', (event) => {

        })
        this.onEvent(this.object.container, 'itemActionEnd', (event) => {

        })
      }
    }, game.player)

    this.on(game.event.playerTick, () => {
      this.animateChanges()
    })
  }

  private populateZone() {
    this.objsToCard.clear()

    this.zone = $('div', style.zone)
    this.element.append(this.zone)

    const container = game.player.container

    this.spots = []
    for (let i = 0; i < container.numSpots; i++) {
      const spot = $('div', style.spot)
      this.spots.push(spot)
      this.zone.append(spot)
    }

    for (const obj of container.contains) {
      this.createCard(obj)
    }
  }

  private animateChanges() {
    if (this.changes.length > 0) {
      let delay = 0
      let time = 1000 / this.changes.length
      for (const change of this.changes) {
        setTimeout(change, delay)
        delay += time
      }
      this.changes.length = 0
    }
  }

  private createCard(obj: GameObject) {
    const card = this.newComponent(ObjectCard, obj)
    this.spots[obj.spot].append(card.element)
    this.objsToCard.set(obj, card)
    return card
  }

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToCard.get(obj)!.element

    if (!elem) return

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
      this.removeComponent(card)
      this.objsToCard.delete(obj)
    }
  }

  private playerMoveZone() {
    const oldZone = this.zone
    const oldCards = [...this.objsToCard.values()]
    const oldPlayer = this.objsToCard.get(game.player)!.element
    const oldPlayerBBox = oldPlayer.getBoundingClientRect()

    this.populateZone()

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
        this.removeComponent(card)
      }
    }

    const fadeInOptions = {
      duration: 500,
      delay: 750,
      easing: 'linear',
    }

    for (const spot of this.spots) {
      animateWithDelay(spot,
          [
            {borderColor: 'transparent'},
            {borderColor: 'var(--borderColor)'}],
          fadeInOptions)
    }

    for (const card of this.objsToCard.values()) {
      if (card.element !== newPlayer) {
        animateWithDelay(card.element, [{opacity: 0}, {opacity: 1}], fadeInOptions)
      }
    }

    oldPlayer.style.opacity = '0'
    animateWithDelay(newPlayer,
        [
          {transform: bBoxDiff(oldPlayerBBox, newPlayerBBox), width: `${oldPlayerBBox.width}px`},
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
