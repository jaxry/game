import '../global.css'
import Component from './Component'
import GameComponent from './Game'

export const outsideElem = document.createElement('div')
outsideElem.classList.add('fixed', 'z-50')

export default class App extends Component {
  constructor (element: HTMLElement) {
    super(element)

    this.element.classList.add('bg-gray-900', 'text-gray-300', 'font-mono')

    this.element.append(
        outsideElem,
        this.newComponent(GameComponent).element)
  }
}