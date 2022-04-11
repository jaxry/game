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

  private changes: (() => void)[] = []
  private finally?: () => void
  private inProgressTime = 0

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
            this.reactivate()
            self.finally = () => self.playerMoveZone()
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
      const elemToBBox = new Map()
      for (const elem of this.objsToElem.values()) {
        elemToBBox.set(elem, elem.getBoundingClientRect())
      }
      for (const change of this.changes) {
        change()
      }
      for (const [elem, oldBBox] of elemToBBox) {
        const bBox = elem.getBoundingClientRect()
        if (bBox.x !== oldBBox.x || bBox.y !== oldBBox.y) {
          animateWithDelay(elem,
              { transform: `translate(${oldBBox.x - bBox.x}px, ${oldBBox.y - bBox.y}px)` },
              { transform: `translate(0, 0)` },
              {
                delay: this.inProgressTime += 100,
                duration: 500,
                easing: 'ease-in-out'
              })
        }
      }
      this.changes.length = 0
    }

    this.finally?.()
    this.finally = undefined
    this.inProgressTime = 0
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

  private moveSpot(obj: GameObject, from: number, to: number) {
    const elem = this.objsToElem.get(obj)!
    this.spots[to].append(elem)
  }

  private objectEnter(obj: GameObject) {
    const elem = this.createObject(obj)
    const bBox = elem.getBoundingClientRect()
    animateWithDelay(elem,
        { opacity: 0, transform: `translate(0, ${bBox.height}px)`},
        { opacity: 1, transform: `translate(0, 0)` },
        { easing: 'ease-in-out', duration: 500, delay: this.inProgressTime += 100 })
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

