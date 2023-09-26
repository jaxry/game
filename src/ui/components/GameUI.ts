import {
  gameSpeed, pauseGameLoop, setGameSpeed, startGameLoop,
} from '../../logic/gameLoop'
import { makeStyle } from '../../util/makeStyle.ts'
import Component from '../../util/Component.ts'
import { visibilityChange } from '../domEvents.ts'
import { game, startGame } from '../../main.ts'
import { createDiv, createElement } from '../../util/createElement.ts'
import { buttonStyle } from '../theme.ts'
import { deleteSave, saveGame } from '../../saveLoad.ts'
import Mat from './Mat.ts'

export default class GameUI extends Component {
  override onInit () {
    this.style(componentStyle)

    // const main = createDiv(this.element, mainStyle)
    // const bar = createDiv(this.element, barStyle)
    //
    // let zone = new Component().appendTo(main)
    //
    // let world: Entity
    // let position: { x: number, y: number }
    //
    // const map = new WorldMap().appendTo(bar)
    // map.onCellClick = (cell, x, y) => {
    //   cell ? changedViewedZoned(cell) : makeZone(world, x, y)
    // }
    //
    // const effect = componentEffect(this, class extends Effect {
    //   override events () {
    //     this.onEntity('gridChanged', () => {
    //       map.render(world, position)
    //     })
    //   }
    // })
    //
    // const onZoneChanged = () => {
    //   world = game.viewedZone.parent ?? world
    //   position = game.viewedZone.gridPosition ?? position
    //   zone = this.newComponent(Zone, game.viewedZone).replace(zone)
    //   map.render(world, position)
    //   effect.setEntity(world)
    // }
    //
    // onZoneChanged()
    // this.on(game.viewedZoneChanged, onZoneChanged)
    //
    // this.newComponent(TimeComponent).appendTo(bar)
    // this.setupSpeedControl(bar)
    // this.setupSaveLoad(bar)
    this.setupGameLoop()

    const mat = this.newComponent(Mat, game.viewedZone).style(mainStyle)
        .appendTo(this.element)
  }

  private setupSaveLoad (container: HTMLElement) {
    const saveLoad = createDiv(container)

    const save = createElement(saveLoad, 'button', buttonStyle, 'Save')
    save.addEventListener('click', () => saveGame(game))

    const load = createElement(saveLoad, 'button', buttonStyle, 'Load')
    load.addEventListener('click', () => startGame())

    const reset = createElement(saveLoad, 'button', buttonStyle, 'Delete')
    reset.addEventListener('click', () => deleteSave())
  }

  private setupSpeedControl (container: HTMLElement) {
    const speedControl = createDiv(container)

    const display = createDiv(speedControl)

    function setSpeed (speed: number) {
      setGameSpeed(speed)
      display.textContent = `Speed: ${speed}`
    }

    setSpeed(1)

    const slower = createElement(speedControl, 'button', buttonStyle, 'Slower')
    slower.addEventListener('click', () => setSpeed(0.5 * gameSpeed()))

    const faster = createElement(speedControl, 'button', buttonStyle, 'Faster')
    faster.addEventListener('click', () => setSpeed(2 * gameSpeed()))
  }

  private setupGameLoop () {
    this.on(visibilityChange, () => {
      document.hidden ? pauseGameLoop() : startGameLoop()
    })
    startGameLoop()
  }
}

const componentStyle = makeStyle({
  width: `100vw`,
  height: `100vh`,
  overflow: `hidden`,
  display: `flex`,
  flexDirection: `column`,
})

const mainStyle = makeStyle({
  flex: `1 1 0`,
  display: `flex`,
  overflow: `hidden`,
})

const barStyle = makeStyle({
  flex: `0 1 20rem`,
  display: `flex`,
  justifyContent: `space-between`,
})