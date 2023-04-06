import Component from './Component'
import TimeComponent from './Time'
import { makeStyle } from '../makeStyle'
import { deleteSaveFile, saveGameToFile } from '../../saveLoad'
import { restartGame } from '../../main'
import { sidebarColor } from '../theme'
import { createDiv, createElement } from '../create'

export default class GameSidebar extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const time = this.newComponent(this.element, TimeComponent)

    // const inventory = this.newComponent(this.element, Inventory, game.player)

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
  background: sidebarColor,
  display: 'flex',
  flexDirection: 'column',
})

const saveLoadContainerStyle = makeStyle({
  flex: '1 1 auto',
  display: `flex`,
  gap: `1rem`,
  justifyContent: `space-evenly`,
  alignItems: `flex-end`,
})