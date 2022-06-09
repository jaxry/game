import Action from '../behavior/Action'

export default class WaitAction extends Action {
  override time = 1

  override get name () {
    return 'wait'
  }

  override do () {

  }
}
