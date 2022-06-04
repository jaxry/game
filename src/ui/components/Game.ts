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
import { StaggerStateChange } from '../StaggerStateChange'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()
export const staggerStateChange = new StaggerStateChange()

export default class GameComponent extends Component {
  constructor() {
    super()

    const time = this.newComponent(TimeComponent)

    const map = this.createMap()

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

    this.on(game.event.playerTickEnd, () => {
      staggerStateChange.start()
    })

    this.setupWindowVisibility()

    startGameLoop()
  }

  private createMap() {
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

  private setupWindowVisibility() {
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
}