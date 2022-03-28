import { Effect } from '../behavior/Effect'
import { game } from '../Game'
import AttackAction from '../actions/Attack'
import { interruptPlayerLoop } from '../behavior/core'
import { elements } from './stores'
import TargetActionAnimation from './TargetActionAnimation.svelte'

export class PlayerUIHook extends Effect {
  override onActivate() {
    // this.onEvent(this.object.container, 'enter', ({item}) => {
    //   console.log(item, 'enter')
    // })
    //
    // this.onEvent(this.object.container, 'leave', ({item}) => {
    //   console.log(item, 'leave')
    // })

    this.onEvent(this.object.container, 'itemActionStart', ({action}) => {
      if (action.object !== game.player && action instanceof AttackAction) {
        interruptPlayerLoop()
      }
    })

    this.onEvent(this.object.container, 'itemActionFinish', ({action}) => {
      if (action.target) {
        const elem = new TargetActionAnimation({
          target: elements.zone,
          props: {
            action,
            destroy: () => elem.$destroy()
          }
        })
      }
    })

    this.onEvent(this.object, 'move', () => {
      this.deactivate().activate()
    })
  }
}
