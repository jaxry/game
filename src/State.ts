import { ComponentChild, div } from './util/Component.ts'

export class StateMachine {
  constructor (public state: State) {
    this.set(state)
  }

  render () {
    return this.state.render()
  }

  set (state: State) {
    this.state = state
    this.state.machine = this
  }
}

export class State {
  machine: StateMachine

  render (): ComponentChild {
    return div()
  }

  set (state: State) {
    this.machine.set(state)
  }
}