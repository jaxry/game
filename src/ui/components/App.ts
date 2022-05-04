import Component from './Component'
import GameComponent from './Game'
import $ from '../makeDomTree'
import style from './App.module.css'

export const outsideElem = $('div', style.outsideContainer)

export default class App extends Component {
  constructor(element: HTMLElement) {
    super(element)
    $(this.element, null, [
      outsideElem,
      this.newComponent(GameComponent),
    ])
  }
}