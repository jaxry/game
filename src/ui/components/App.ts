import Component from './Component'
import GameComponent from './Game'
import style from './App.module.css'

export const outsideElem = document.createElement('div')
outsideElem.classList.add(style.outsideContainer)

export default class App extends Component {
  constructor(element: HTMLElement) {
    super(element)

    this.element.append(
        outsideElem,
        this.newComponent(GameComponent).element)
  }
}