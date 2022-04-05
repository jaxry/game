import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'
import { GameObject } from '../../GameObject'
import style from './Zone.module.css'

export default class Zone extends Component {
  objsToElem = new Map<GameObject, HTMLElement>()
  zone!: HTMLElement
  spots: HTMLElement[] = []

  constructor() {
    super($('div', style.container))

    const self = this

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object, 'move', () => {
          this.reactivate()
          self.moveZones()
        })

        this.onEvent(this.object.container, 'enter', ({item}) => {
          // console.log('enter', item)
        })

        this.onEvent(this.object.container, 'leave', ({item}) => {
          // console.log('leave', item)
        })
      }
    }, game.player)

    this.populate()
  }

  private populate() {
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
      const elem = $('div', style.object, obj.type.name)
      this.spots[obj.spot].append(elem)
      this.objsToElem.set(obj, elem)
    }
  }

  private moveZones() {
    const oldPlayer = this.objsToElem.get(game.player)!
    oldPlayer.style.opacity = '0'

    const oldPlayerBbox = oldPlayer.getBoundingClientRect()
    const oldZone = this.zone

    this.populate()

    const newPlayer = this.objsToElem.get(game.player)!
    const newPlayerBbox = newPlayer.getBoundingClientRect()
    const playerBboxDiff = bboxDifference(oldPlayerBbox, newPlayerBbox)

    oldZone.animate({
      transform: `translate(0, ${-this.element.offsetHeight}px)`,
      // transform: `translate(-${this.element.offsetWidth}px, 0)`,
      opacity: 0
    }, {
      duration: 1000,
      easing: 'ease-in-out'
    }).onfinish = () => {
      oldZone.remove()
    }

    const newZone = this.zone
    newZone.animate({
      // transform: [`translate(${this.element.offsetWidth}px, 0)`, 'translate(0, 0)'],
      transform: [`translate(0, ${this.element.offsetHeight}px)`, 'translate(0, 0)'],
    }, {
      duration: 1000,
      easing: 'ease-in-out'
    })

    for (const elem of this.objsToElem.values()) {
      if (elem !== newPlayer) {
        elem.animate({
          opacity: [0, 1],
        }, {
          duration: 1000,
          easing: 'ease-in-out'
        })
      }
    }

    newPlayer.animate({
      transform: [`translate(${ playerBboxDiff.x}px, ${-this.element.offsetHeight + playerBboxDiff.y}px)`, 'translate(0, 0)'],
    }, {
      duration: 1000,
      easing: 'ease-in-out',
    })
  }
}

function bboxDifference(before: DOMRect, after: DOMRect) {
  return {
    x: before.x - after.x,
    y: before.y - after.y,
    width: before.width / after.width,
    height: before.height / after.height
  }
}