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
import { makeStyle } from '../makeStyle'
import { border } from '../theme'
import GameComponent from './GameComponent'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()
export const staggerStateChange = new StaggerStateChange()

export default class GameUI extends GameComponent {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const map = this.createMap()
    map.element.classList.add(mapStyle)
    this.element.append(map.element)

    const zone = this.newComponent(Zone)
    zone.element.classList.add(zoneStyle)
    this.element.append(zone.element)

    const info = document.createElement('div')
    info.classList.add(infoStyle)
    this.element.append(info)

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
            map.setCenter(this.object.container)
            this.reactivate()
          }
        })
      }
    }, game.player)

    game.event.mapUpdated.on(() => {
      map.setCenter(game.player.container)
    })

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

const containerStyle = makeStyle({
  height: `100%`,
  display: `grid`,
  gridTemplateColumns: `20rem 1fr`,
  gridTemplateRows: `1fr 20rem`,
  gridTemplateAreas: `"zone zone" 
                      "map  info"`,
})

const zoneStyle = makeStyle({
  gridArea: `zone`,
  borderBottom: border,
})

const mapStyle = makeStyle({
  gridArea: `map`,
})

const infoStyle = makeStyle({
  gridArea: `info`,
})

