import Component from './Component'
import { makeStyle } from '../makeStyle'
import { backgroundColor, textColor } from '../theme'
import { createDiv } from '../createElement'
import GameUI from './GameUI'
import '../main.css'

export default class App extends Component {
  override onInit () {
    this.element.classList.add(containerStyle)

    this.newComponent(GameUI).appendTo(this.element)
    this.element.append(outsideElement)
    // this.newComponent(Base).appendTo(this.element)
  }
}

const containerStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor,
  color: textColor,
  height: `100vh`,
  contain: `strict`,
  userSelect: `none`,
})

const outsideElemStyle = makeStyle({
  zIndex: `99`,
})

export const outsideElement = createDiv(null, outsideElemStyle)
