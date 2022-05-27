import '../global.css'
import style from './Game.module.css'
import Component from './Component'
import $ from '../makeDomTree'
import { game } from '../../Game'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { Effect } from '../../behavior/Effect'
import Zone from './Zone'
import { interruptPlayerLoop, startGameLoop } from '../../behavior/core'
import TimeComponent from './Time'
import DragAndDrop from '../DragAndDrop'
import { GameObject } from '../../GameObject'
import Player from './Player'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()

export default class GameComponent extends Component {
  constructor() {
    super()

    const time = this.newComponent(TimeComponent)

    const map = this.setupMap()

    const zone = this.newComponent(Zone)

    const player = this.newComponent(Player)

    $(this.element, style.game, [
      [
        'div', style.global, [
        time,
        player,
      ]],
      [zone, style.zone],
      [map, style.map],
    ])

    startGameLoop()

    function visibilityChange() {
      if (document.hidden) {
        interruptPlayerLoop()
      } else {
        startGameLoop()
      }
    }

    document.addEventListener('visibilitychange', visibilityChange)
    this.onRemove(() => {
      document.removeEventListener('visibilitychange', visibilityChange)
    })
  }

  private setupMap() {
    const map = this.newComponent(MapComponent)

    map.onZoneClick = playerTravelToZone

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            map.update(this.object.container)
            this.reactivate()
          }
        })
      }
    }, game.player)

    return map
  }
}