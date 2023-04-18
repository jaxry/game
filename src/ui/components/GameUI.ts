import { game } from '../../Game'
import MapComponent from './Map'
import Effect from '../../behavior/Effect'
import {
  pauseGameLoop, resumeGameLoop, startGameLoop,
} from '../../behavior/core'
import DragAndDrop from '../DragAndDrop'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { border } from '../theme'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()

export default class GameUI extends GameComponent {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    // const sidebar = this.newComponent(GameSidebar)
    // sidebar.element.classList.add(sidebarStyle)
    // this.element.append(sidebar.element)

    this.createMap()
    this.setupWindowVisibility()
    startGameLoop()
  }

  private createMap () {
    const map = this.newComponent(this.element, MapComponent)
    map.element.classList.add(mapStyle)

    const mapEffect = this.newEffect(class extends Effect {
      override events () {
        this.on(this.object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            map.render(this.object.container)
            this.reregisterEvents()
          }
        })
      }
    }, game.player)

    this.on(game.event.playerChange, () => {
      mapEffect.setObject(game.player)
    })

    this.on(game.event.mapPositionUpdate, () => {
      map.updatePositions()
    })

    this.on(game.event.mapUpdate, () => {
      map.render(game.player.container)
    })

    setTimeout(() => {
      map.render(game.player.container)
    })

    return map
  }

  private setupWindowVisibility () {
    function visibilityChange () {
      document.hidden ? pauseGameLoop() : resumeGameLoop()
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
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})


