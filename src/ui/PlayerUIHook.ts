import { Effect } from '../behavior/Effect'
import { game } from '../Game'
import AttackAction from '../actions/Attack'
import { interruptPlayerLoop } from '../behavior/core'
import { attackAnimations } from './stores'

export class PlayerUIHook extends Effect {
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
      if (action instanceof AttackAction) {
        // await tick()
        // animateAttack(gameObjectToCard.get(action.object), gameObjectToCard.get(action.target))
        attackAnimations.add(action)
      }
    })

    this.onEvent(this.object, 'move', () => {
      this.deactivate().activate()
    })
  }
}

function animateAttack(from: HTMLElement, to: HTMLElement) {
  console.log(from, to)
}