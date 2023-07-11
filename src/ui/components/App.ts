import Component from './Component'
import { addStyle, makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor, fontColor } from '../theme'
import { createDiv } from '../createElement'
import Tester from './Tester'
import GameUI from './GameUI'

export default class App extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(outsideElem)
    // this.newComponent(GameUI).appendTo(this.element)
    this.newComponent(Tester).appendTo(this.element)
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

addStyle(`.${outsideElemStyle} > *`, {
  position: `fixed`,
})

export const outsideElem = createDiv(null, outsideElemStyle)
