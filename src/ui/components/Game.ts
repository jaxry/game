import '../global.css'
import style from './Game.module.css'
import Component from './Component'
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

    this.element.classList.add(style.container)

    const map = this.createMap()
    map.element.classList.add(style.map)
    this.element.append(map.element)

    const zone = this.newComponent(Zone)
    zone.element.classList.add(style.zone)
    this.element.append(zone.element)

    const global = document.createElement('div')
    global.classList.add(style.global)
    this.element.append(global)

    const time = this.newComponent(TimeComponent)
    global.append(time.element)

    const player = this.newComponent(Player)
    global.append(player.element)

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