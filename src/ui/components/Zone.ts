import Component from './Component'
import $ from '../makeDomTree'
import { Effect } from '../../behavior/Effect'
import { game } from '../../Game'

export default class Zone extends Component {
  constructor() {
    super($('div'))

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object, 'move', () => {
          this.reactivate()
          console.log('move', this.object.container)
        })

        this.onEvent(this.object.container, 'enter', ({item}) => {
          console.log('enter', item)
        })

        this.onEvent(this.object.container, 'leave', ({item}) => {
          console.log('leave', item)
        })
      }
    }, game.player)
  }
}