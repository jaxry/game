import { game } from '../../Game'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import Effect from '../../behavior/Effect'
import Zone from './Zone'
import { pauseGameLoop, startGameLoop } from '../../behavior/core'
import TimeComponent from './Time'
import DragAndDrop from '../DragAndDrop'
import GameObject from '../../GameObject'
import Player from './Player'
import StaggerStateChange from '../StaggerStateChange'
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


    this.on(game.event.tickEnd, () => {
      staggerStateChange.start()
    })

    this.setupWindowVisibility()

    startGameLoop()
  }

  private createMap () {
    const map = this.newComponent(MapComponent)

    const mapEffect = this.newEffect(class extends Effect {
      override registerEvents () {
        this.onEvent(this.object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            map.setCenter(this.object.container)
            this.reregisterEvents()
          }
        })
      }
    }, game.player)

    this.on(game.event.playerChange, () => {
      mapEffect.setObject(game.player)
    })

    this.on(game.event.mapUpdated, () => {
      map.setCenter(game.player.container)
    })

    // map needs a frame to render before animations work
    setTimeout(() => {
      map.setCenter(game.player.container)
    })

    return map
  }

  private setupWindowVisibility () {
    function visibilityChange () {
      if (document.hidden) {
        pauseGameLoop()
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
  display: `flex`,
  flexDirection: `column`,
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})

const zoneStyle = makeStyle({
  flex: `1 1 0`,
})


