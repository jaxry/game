import Component from './Component'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor } from '../theme'
import World from './World'

export default class App extends Component {

  constructor (element: HTMLElement) {
    super(element)
    const world = this.newComponent(World)
    this.element.append(world.element)
  }
}

makeStyle('body', {
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor[900],
  color: backgroundColor[200],
  height: `100vh`,
  overflow: `hidden`,
  display: `flex`,
  flexDirection: `column`,
  justifyContent: `center`,
})