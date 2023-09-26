import Entity from '../Entity.ts'
import { pathFind } from './gridPathFinding.ts'
import { isDestroyed } from './destroy.ts'
import { serializable } from '../util/serialize.ts'

export default class PathMove {
  private destination: Entity
  private path: Entity[]

  constructor (public entity: Entity) {

  }

  get zone () {
    return this.entity.parent
  }

  next (destination: Entity) {
    const invalid = destination !== this.destination ||
        this.path.at(-1) !== this.zone ||
        this.path.at(-2) && isDestroyed(this.path.at(-2)!)

    if (invalid) {
      return this.newDestination(destination)
    }

    this.path.pop()

    return this.path.at(-1)
  }

  newDestination (destination: Entity) {
    this.path = pathFind(this.zone, destination)
    this.destination = destination
    return this.path.at(-1)
  }
}
serializable(PathMove)