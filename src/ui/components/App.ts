import Component from './Component'
import { makeStyle } from '../makeStyle'
import '../preflight.css'
import { backgroundColor } from '../theme'
import CardTable from './CardTable'
import CardList from './CardList'
import Tabs from './Tabs'

export default class App extends Component {
  override onInit () {
    this.element.classList.add(containerStyle)

    this.newComponent(Tabs, [
      {
        name: 'List',
        component: CardList,
      }, {
        name: 'Cards',
        component: CardTable,
      },
    ]).appendTo(this.element)
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

