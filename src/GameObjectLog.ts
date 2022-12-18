import type GameObject from './GameObject'

export default class GameObjectLog {
  log: Map<GameObject, string[]> = new Map()

  write (object: GameObject, message: string) {
    let arr = this.log.get(object)
    if (!arr) {
      arr = []
      this.log.set(object, arr)
    }

    arr.push(message)
  }

  get (object: GameObject) {
    return this.log.get(object)
  }

  clear () {
    this.log.clear()
  }
}