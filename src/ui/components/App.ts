import Component from './Component'
import GameUI from './GameUI'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor, fontColor } from '../theme'
import { createDiv } from '../create'

export default class App extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(outsideElem)
    this.newComponent(this.element, GameUI)
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

export const outsideElem = createDiv(null, outsideElemStyle)
