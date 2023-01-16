import { game } from '../../Game'
import MapComponent from './Map'
import Effect from '../../behavior/Effect'
import { pauseGameLoop, startGameLoop } from '../../behavior/core'
import DragAndDrop from '../DragAndDrop'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import GameSidebar from './GameSidebar'
import { backgroundColor, border } from '../theme'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()

export default class GameUI extends GameComponent {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const sidebar = this.newComponent(GameSidebar)
    sidebar.element.classList.add(sidebarStyle)
    this.element.append(sidebar.element)

    const map = this.createMap()
    map.element.classList.add(mapStyle)
    this.element.append(map.element)

    this.setupWindowVisibility()
    startGameLoop()
  }

  private createMap () {
    const map = this.newComponent(MapComponent)

    const mapEffect = this.newEffect(class extends Effect {
      override events () {
        this.on(this.object.container, 'leave', ({ item }) => {
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
})

const sidebarStyle = makeStyle({
  flex: `0 0 25rem`,
  borderRight: border,
  background: backgroundColor[800],
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})


