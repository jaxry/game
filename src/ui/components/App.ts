import Component from './Component'
import GameComponent from './Game'
import { makeStyle } from '../makeStyle'

export const outsideElem = document.createElement('div')
outsideElem.classList.add(makeStyle({
  position: `fixed`,
  zIndex: `99`,
}))

export default class App extends Component {
  constructor (element: HTMLElement) {
    super(element)

    this.element.append(
        outsideElem,
        this.newComponent(GameComponent).element)
  }
}