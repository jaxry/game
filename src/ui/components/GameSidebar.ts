import Component from './Component'
import TimeComponent from './Time'
import Inventory from './Inventory'
import { game } from '../../Game'
import { makeStyle } from '../makeStyle'
import { deleteSaveFile, saveGameToFile } from '../../saveLoad'
import { restartGame } from '../../main'
import { sidebarColor } from '../theme'

export default class GameSidebar extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const time = this.newComponent(TimeComponent)
    this.element.append(time.element)

    const inventory = this.newComponent(Inventory, game.player)
    this.element.append(inventory.element)

    const saveLoadContainer = document.createElement('div')
    saveLoadContainer.classList.add(saveLoadContainerStyle)
    this.element.append(saveLoadContainer)

    const save = document.createElement('button')
    save.innerText = 'Save'
    save.addEventListener('click', saveGameToFile)
    saveLoadContainer.append(save)

    const load = document.createElement('button')
    load.innerText = 'Load'
    load.addEventListener('click', restartGame)
    saveLoadContainer.append(load)

    const erase = document.createElement('button')
    erase.innerText = 'Erase'
    erase.addEventListener('click', deleteSaveFile)
    saveLoadContainer.append(erase)

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