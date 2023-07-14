import Component from './Component'
import { addStyle, makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor, fontColor } from '../theme'
import { createDiv } from '../createElement'
import Tester from './Tester'

export default class App extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(outsideElem)
    // this.newComponent(GameUI).appendTo(this.element)

    const c1 = createDiv(this.element, columnStyle)
    const c2 = createDiv(this.element, columnStyle)
    this.newComponent(Tester).appendTo(c1)
    this.newComponent(Tester).appendTo(c1)

    this.newComponent(Tester).appendTo(c2)
    this.newComponent(Tester).appendTo(c2)

  }
}

const containerStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor,
  color: fontColor,
  height: `100vh`,
  contain: `strict`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
})

const columnStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
})

const outsideElemStyle = makeStyle({
  position: `fixed`,
  zIndex: `99`,
})

addStyle(`.${outsideElemStyle} > *`, {
  position: `fixed`,
})

export const outsideElem = createDiv(null, outsideElemStyle)
