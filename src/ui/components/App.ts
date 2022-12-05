import Component from './Component'
import GameUI from './GameUI'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor } from '../theme'

export const outsideElem = document.createElement('div')
outsideElem.classList.add(makeStyle({
  position: `fixed`,
  zIndex: `99`,
}))

export default class App extends Component {
  constructor (element: HTMLElement) {
    super(element)

    this.element.classList.add(containerStyle)

    this.element.append(
        outsideElem,
        this.newComponent(GameUI).element)
  }
}

const containerStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor[900],
  color: backgroundColor[200],
  height: `100vh`,
  overflow: `hidden`,
})