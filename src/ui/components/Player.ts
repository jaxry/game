import Component from './Component'
import $ from '../makeDomTree'
import style from './Player.module.css'
import { game } from '../../Game'
import Inventory from './Inventory'

export default class Player extends Component {
  constructor() {
    super()

    $(this.element, style.container, [
      $('div', null, 'Inventory'),
      this.newComponent(Inventory, game.player),
    ])
  }
}