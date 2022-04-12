import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import ObjectInfo from './ObjectInfo'
import { isPlayer } from '../../behavior/player'
import animateWithDelay from '../animateWithDelay'
import removeElementFromList from '../removeElementFromList'

export default class Zone extends Component {
  private objsToElem = new Map<GameObject, HTMLElement>()
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
    this.objsToElem.clear()

    this.zone = $('div', style.zone)
    this.element.append(this.zone)

    this.spots = []
    for (let i = 0; i < 5; i++) {
      const spot = $('div', style.spot)
      this.spots.push(spot)
      this.zone.append(spot)
    }

    for (const obj of game.player.container.contains) {
      this.createObject(obj)
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

  private createObject(obj: GameObject) {
    const elem = $('div', style.object, obj.type.name)
    if (isPlayer(obj)) {
      elem.classList.add(style.player)
    }

    this.spots[obj.spot].append(elem)

    this.objsToElem.set(obj, elem)

    elem.addEventListener('click', () => {
      const info = this.newComponent(ObjectInfo, obj,
          elem.getBoundingClientRect())
      info.exit = () => this.removeComponent(info)
    })

    return elem
  }

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToElem.get(obj)!

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
    const elem = this.createObject(obj)
    elem.animate([
      {opacity: 0, transform: `translate(0, 200%)`},
      {opacity: 1, transform: `translate(0, 0)`},
    ], {
      easing: 'ease-in-out',
      duration: 500,
    })
  }

  private objectLeave(obj: GameObject) {
    const elem = this.objsToElem.get(obj)!
    elem.animate({
      zIndex: ['999', '999'],
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
    }

  }

  private playerMoveZone() {
    const oldZone = this.zone
    const oldPlayer = this.objsToElem.get(game.player)!
    const oldPlayerBBox = oldPlayer.getBoundingClientRect()

    this.populateZone()

    const newPlayer = this.objsToElem.get(game.player)!
    const newPlayerBBox = newPlayer.getBoundingClientRect()

    oldZone.animate({
      opacity: 0,
    }, {
      duration: 500,
      easing: 'linear',
    }).onfinish = () => {
      oldZone.remove()
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

    for (const elem of this.objsToElem.values()) {
      if (elem !== newPlayer) {
        animateWithDelay(elem, [{opacity: 0}, {opacity: 1}], fadeInOptions)
      }
    }

    oldPlayer.style.opacity = '0'
    animateWithDelay(newPlayer,
        [
          {transform: bBoxDiff(oldPlayerBBox, newPlayerBBox)},
          {transform: `translate(0, 0)`}],
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
