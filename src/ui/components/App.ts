import Component from './Component'
import GameUI from './GameUI'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor, fontColor } from '../theme'

export default class App extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(outsideElem)
    this.element.append(this.newComponent(GameUI).element)
  }
}

const containerStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor,
  color: fontColor,
  height: `100vh`,
  contain: `strict`,
})

const outsideElemStyle = makeStyle({
  position: `fixed`,
  zIndex: `99`,
})

makeStyle(`.${outsideElemStyle} > *`, {
  position: `fixed`,
})

export const outsideElem = document.createElement('div')
outsideElem.classList.add(outsideElemStyle)
