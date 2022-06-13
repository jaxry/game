import Component from './Component'
import GameComponent from './Game'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import colors from '../colors'

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

makeStyle('body', {
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: colors.zinc[900],
  color: colors.zinc[200],
})