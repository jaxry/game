import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'
import ObjectInfo from './ObjectInfo'
import { isPlayer } from '../../behavior/player'

export default class Zone extends Component {
  objsToElem = new Map<GameObject, HTMLElement>()
  zone!: HTMLElement
  spots: HTMLElement[] = []

  constructor() {
    super()

    this.element.classList.add(style.container)

    this.populateZone()

    const self = this

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'enter', ({item}) => {
          console.log('enter', item)
        })

        this.onEvent(this.object.container, 'leave', ({item}) => {
          if (item === this.object) {
            this.reactivate()
            self.moveZones()
          }
        })

        this.onEvent(this.object.container, 'moveSpot', ({item}) => {
          console.log(item, 'moves')
        })
      }
    }, game.player)
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
  }

  private moveZones() {
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

function animateWithDelay(elem: HTMLElement, from: Keyframe, to: Keyframe, options: KeyframeAnimationOptions) {
  const delay = Number(options.delay) ?? 0
  const duration = Number(options.duration) ?? 1000
  const total = delay + duration
  elem.animate([
    {
      ...from,
      easing: 'linear'
    },
    {
      ...from,
      easing: options.easing || 'linear',
      offset: delay / total
    },
    to
  ], {
    ...options,
    duration: total,
    delay: 0,
  })
}