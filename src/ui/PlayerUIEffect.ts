import { Effect } from '../behavior/Effect'
import { game } from '../Game'
import AttackAction from '../actions/Attack'
import { interruptPlayerLoop } from '../behavior/core'
import { gameObjectToCard } from './stores'
import { tick } from 'svelte'

export class PlayerUIEffect extends Effect {
  override onActivate() {
    this.onEvent(this.object.container, 'enter', ({item}) => {
      console.log(item, 'enter')
    })

    this.onEvent(this.object.container, 'leave', ({item}) => {
      console.log(item, 'leave')
    })

    this.onEvent(this.object.container, 'itemActionStart', ({action}) => {
      if (action.object !== game.player && action instanceof AttackAction) {
        interruptPlayerLoop()
      }
    })

    this.onEvent(this.object.container, 'itemActionFinish', async ({action}) => {
      await tick()
      console.log('finished', action, gameObjectToCard.get(action.object))
    })

    this.onEvent(this.object, 'move', () => {
      this.deactivate().activate()
    })
  }
}