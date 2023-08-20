import { game } from '../../Game'
import MapComponent from './Map'
import Effect from '../../effects/Effect'
import { pauseGameLoop, startGameLoop } from '../../behavior/gameLoop'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { createDiv, createElement } from '../createElement'
import { deleteSaveFile, saveGameToFile } from '../../saveLoad'
import { restartGame } from '../../main'
import { gameDataColor, textButtonStyle } from '../theme'
import { getPlayer } from '../../behavior/player'

export default class GameUI extends GameComponent {
  override onInit () {
    this.element.classList.add(containerStyle)

    this.createMap()
    this.createGameBar()
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
    }, getPlayer())

    this.on(game.event.playerChange, (player) => {
      mapEffect.changeObject(player)
    })

    this.on(game.event.worldModified, () => {
      map.render(getPlayer().container, false, true)
    })

    map.render(getPlayer().container, true)

    return map
  }

  private createGameBar () {
    const bar = createDiv(this.element, barStyle)

    const info = createDiv(bar, infoStyle)

    // energy level
    const energy = createDiv(info, undefined, 'Energy Pool: ')
    const energyValue = createElement(energy, 'span', energyStyle)

    setInterval(() => {
      energyValue.textContent = game.energyPool.toString()
    }, 1000)

    // save load bar
    const saveLoadContainer = createDiv(bar, saveLoadContainerStyle)

    const save = createElement(saveLoadContainer, 'button', textButtonStyle,
        'Save')
    save.addEventListener('click', saveGameToFile)

    const load = createElement(saveLoadContainer, 'button', textButtonStyle,
        'Load')
    load.addEventListener('click', restartGame)

    const erase = createElement(saveLoadContainer, 'button', textButtonStyle,
        'Erase')
    erase.addEventListener('click', deleteSaveFile)
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
}

const containerStyle = makeStyle({
  height: `100%`,
  display: `flex`,
})

const barStyle = makeStyle({
  display: `flex`,
  position: `absolute`,
  left: `0`,
  right: `0`,
})

const infoStyle = makeStyle({
  flex: `1 1 auto`,
})

const energyStyle = makeStyle({
  color: gameDataColor,
})

const saveLoadContainerStyle = makeStyle({
  display: `flex`,
  gap: `1rem`,
})

const mapStyle = makeStyle({
  flex: `1 1 0`,
})


