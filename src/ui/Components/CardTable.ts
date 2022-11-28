import Component from './Component'
import CardTableSpawner from './CardTableSpawner'
import CardTableMat from './CardTableMat'
import { makeStyle } from '../makeStyle'
import { border } from '../theme'

export default class CardTable extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    const spawner = this.newComponent(CardTableSpawner)
    spawner.element.classList.add(cardSpawnerStyle)
    this.element.append(spawner.element)

    const mat = this.newComponent(CardTableMat)
    mat.element.classList.add(cardMatStyle)
    this.element.append(mat.element)
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  height: `100%`,
})

const cardSpawnerStyle = makeStyle({
  flex: `0 0 auto`,
  padding: `1rem`,
  borderBottom: border,
})

const cardMatStyle = makeStyle({
  flex: `1 1 auto`,
})