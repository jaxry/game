import Component from '../../util/Component.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { backgroundColor, textColor } from '../theme'
import GameUI from './GameUI'
import '../../util/cssReset.ts'
import { windowContainer } from '../../util/makeWindow.ts'

export default class App extends Component {
  override onInit () {
    this.style(componentStyle)

    this.element.append(windowContainer)

    this.newComponent(GameUI).appendTo(this.element)
  }
}

const componentStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor,
  color: textColor,
  userSelect: `none`,
})
