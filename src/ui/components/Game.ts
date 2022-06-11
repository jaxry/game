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
  constructor () {
    super()

    this.element.classList.add(
        'h-screen', 'overflow-hidden', 'flex', 'flex-col')

    const zone = this.newComponent(Zone)
    this.element.append(zone.element)

    const controls = document.createElement('div')
    controls.classList.add(
        'shrink-0', 'basis-[280px]',
        'border-t', 'border-color-border',
        'flex')
    this.element.append(controls)

    const map = this.createMap()
    map.element.classList.add('shrink-0', 'basis-[280px]')
    controls.append(map.element)

    const info = document.createElement('div')
    info.classList.add('flex-1')
    controls.append(info)

    const time = this.newComponent(TimeComponent)
    info.append(time.element)

    const player = this.newComponent(Player)
    info.append(player.element)

    this.on(game.event.playerTickEnd, () => {
      staggerStateChange.start()
    })

    this.setupWindowVisibility()

    startGameLoop()
  }

  private createMap () {
    const map = this.newComponent(MapComponent)

    map.onZoneClick = playerTravelToZone

    this.newEffect(class extends Effect {
      onActivate () {
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

  private setupWindowVisibility () {
    function visibilityChange () {
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