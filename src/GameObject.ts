import Vector2 from './Vector2'

let nextId = 1

export default class GameObject {
  id = nextId++
  position = new Vector2()
  velocity = new Vector2()
  acceleration = new Vector2()
  cellBefore: null | GameObject = null
  cellAfter: null | GameObject = null
}