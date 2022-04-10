import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import ObjectInfo from './ObjectInfo'
import { isPlayer } from '../../behavior/player'
import { GameObjectEvents } from '../../GameObjectType'
import animateWithDelay from '../animateWithDelay'

export default class Zone extends Component {
  private objsToElem = new Map<GameObject, HTMLElement>()
  private zone!: HTMLElement
  private spots: HTMLElement[] = []

  private movedSpot: GameObjectEvents['moveSpot'][] = []
  private enteredZone: GameObjectEvents['enter'][] = []
  private leftZone: GameObjectEvents['leave'][] = []

  constructor() {
    super()

    this.element.classList.add(style.container)

    this.populateZone()

    const self = this

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'enter', (event) => {
          // if (!isPlayer(item)) {
          //   self.objectEnter(item)
          // }
          self.enteredZone.push(event)
        })

        this.onEvent(this.object.container, 'leave', (event) => {
          if (event.item === this.object) {
            this.reactivate()
          //   self.playerMoveZone()
          // } else {
          //   self.objectLeave(item)
          }
          self.leftZone.push(event)
        })

        this.onEvent(this.object.container, 'moveSpot', (event) => {
          self.movedSpot.push(event)
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
    for (let i = 0; i < this.movedSpot.length; i++) {
      const event = this.movedSpot[i]
      this.moveSpot(event.item, event.from, event.to, i)
    }
    this.movedSpot.length = 0
  }

  private createObject(obj: GameObject) {
    const elem = $('div', style.object, obj.type.name)
    if (isPlayer(obj)) {
      elem.classList.add(style.player)
    }

    this.spots[obj.spot].append(elem)

    this.objsToElem.set(obj, elem)

    elem.addEventListener('click', () => {
      const info = this.newComponent(ObjectInfo, obj, elem.getBoundingClientRect())
      info.exit = () => this.removeComponent(info)
    })

    return elem
  }

  private moveSpot(obj: GameObject, from: number, to: number, count: number) {
    const elem = this.objsToElem.get(obj)!
    const fromBBox = elem.getBoundingClientRect()
    setTimeout(() => {
      this.spots[to].append(elem)
      const toBBox = elem.getBoundingClientRect()
      elem.animate([
        { transform: `translate(${fromBBox.x - toBBox.x}px, ${fromBBox.y - toBBox.y}px)` },
        { transform: `translate(0, 0)` }
      ], {
        duration: 500,
        easing: 'ease-in-out'
      })
    })
  }

  private objectEnter(obj: GameObject) {
    const elem = this.createObject(obj)
    const bBox = elem.getBoundingClientRect()
    elem.animate({
      opacity: [0, 1],
      transform: [`translate(0, ${bBox.height}px)`, `translate(0,0)`]
    }, {
      easing: 'ease-in-out',
      duration: 500
    })
  }

  private objectLeave(obj: GameObject) {
    const elem = this.objsToElem.get(obj)!
    elem.remove()
  }

  private playerMoveZone() {
    const oldZone = this.zone
    const oldPlayer = this.objsToElem.get(game.player)!
    const oldPlayerBBox = oldPlayer.getBoundingClientRect()

    this.populateZone()

    const newPlayer = this.objsToElem.get(game.player)!
    const newPlayerBBox = newPlayer.getBoundingClientRect()
    const bBoxDiff = bBoxDifference(oldPlayerBBox, newPlayerBBox)

    oldZone.animate({
      opacity: 0
    }, {
      duration: 500,
      easing: 'linear'
    }).onfinish = () => {
      oldZone.remove()
    }

    const fadeInOptions = {duration: 500, delay: 500, easing: 'linear'}

    for (const spot of this.spots) {
      animateWithDelay(spot,
          {borderImage: 'linear-gradient(transparent, transparent) 1'},
          {borderImage: ''},
          fadeInOptions)
    }

    for (const elem of this.objsToElem.values()) {
      if (elem !== newPlayer) {
        animateWithDelay(elem, {opacity: 0}, {opacity: 1}, fadeInOptions)
      }
    }

    oldPlayer.style.opacity = '0'
    animateWithDelay(newPlayer,
        {transform: `translate(${bBoxDiff.x}px, ${bBoxDiff.y}px)`},
        {transform: `translate(0, 0)`},
        {
          delay: 500,
          duration: 1000,
          easing: 'ease-in-out',
        })
  }
}

function bBoxDifference(before: DOMRect, after: DOMRect) {
  return {
    x: before.x - after.x,
    y: before.y - after.y,
    width: before.width / after.width,
    height: before.height / after.height
  }
}

