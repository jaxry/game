import { game } from '../../Game'
import MapComponent from './Map'
import Effect from '../../effects/Effect'
import { pauseGameLoop, startGameLoop } from '../../behavior/gameLoop'
import DragAndDrop from '../DragAndDrop'
import GameObject from '../../GameObject'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { createDiv, createElement } from '../createElement'
import { deleteSaveFile, saveGameToFile } from '../../saveLoad'
import { restartGame } from '../../main'

export const dragAndDropGameObject = new DragAndDrop<GameObject>()

export default class GameUI extends GameComponent {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.createMap()
    this.createSaveLoadBar()
    this.setupWindowVisibility()
    startGameLoop()
  }

  private createMap () {
    const map = this.newComponent(MapComponent).appendTo(this.element)
    map.element.classList.add(mapStyle)

    const mapEffect = this.newEffect(class extends Effect {
      override events () {
        this.onObject('enter', () => {
          map.render(this.object.container, true)
        })
      }
    }, game.player)

    this.on(game.event.playerChange, () => {
      mapEffect.changeObject(game.player)
    })

    this.on(game.event.worldModified, () => {
      map.render(game.player.container, false, true)
    })

    setTimeout(() => {
      map.render(game.player.container, true)
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
  gap: `1rem`,
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})


