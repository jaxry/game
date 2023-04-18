import { game } from '../../Game'
import MapComponent from './Map'
import Effect from '../../behavior/Effect'
import { gameLoop, pauseGameLoop, startGameLoop } from '../../behavior/core'
import DragAndDrop from '../DragAndDrop'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { border } from '../theme'
import { createDiv, createElement } from '../create'
import { deleteSaveFile, saveGameToFile } from '../../saveLoad'
import { restartGame } from '../../main'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()

export default class GameUI extends GameComponent {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    // const sidebar = this.newComponent(GameSidebar)
    // sidebar.element.classList.add(sidebarStyle)
    // this.element.append(sidebar.element)

    this.createMap()
    this.createSaveLoadBar()
    this.setupWindowVisibility()
    gameLoop()
  }

  private createMap () {
    const map = this.newComponent(this.element, MapComponent)
    map.element.classList.add(mapStyle)

    const mapEffect = this.newEffect(class extends Effect {
      override events () {
        this.onContainer('leave', ({ object }) => {
          if (object === this.object) {
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
      document.hidden ? pauseGameLoop() : startGameLoop()
    }

    document.addEventListener('visibilitychange', visibilityChange)
    this.onRemove(() => {
      document.removeEventListener('visibilitychange', visibilityChange)
    })
  }

  private createSaveLoadBar () {
    const saveLoadContainer = createDiv(this.element, saveLoadContainerStyle)

    const save = createElement(saveLoadContainer, 'button', undefined, 'Save')
    save.addEventListener('click', saveGameToFile)

    const load = createElement(saveLoadContainer, 'button', undefined, 'Load')
    load.addEventListener('click', restartGame)

    const erase = createElement(saveLoadContainer, 'button', undefined, 'Erase')
    erase.addEventListener('click', deleteSaveFile)
  }
}

const containerStyle = makeStyle({
  height: `100%`,
  display: `flex`,
})

const saveLoadContainerStyle = makeStyle({
  position: `absolute`,
  display: `flex`,
  gap: `1rem`
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})


