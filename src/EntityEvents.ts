import { Action } from './effects/actions/action.ts'
import Entity from './Entity.ts'
import { deleteIndexedElement, IndexedArrayElement } from './util/util.ts'
import { LogEntry } from './gameLog.ts'

export class EntityEvents {
  log: [this: any, message: (this: any) => LogEntry]

  enter: [from?: Entity]
  leave: [to?: Entity]

  gridChanged: []

  actionStart: [action: Action]
  actionEnd: [action: Action]
}

export type EntityEvent = keyof EntityEvents

export type EntityEventObserver<T extends EntityEvent> =
    (entity: Entity, ...args: EntityEvents[T]) => void

export type EntityEventMap = {
  [T in EntityEvent]?: ActiveEntityEvent<T>[]
}

export class ActiveEntityEvent<T extends EntityEvent = any>
    implements IndexedArrayElement {
  _index: number

  constructor (
      private observers: ActiveEntityEvent<T>[],
      public observer: EntityEventObserver<T>) {
  }

  unsubscribe () {
    deleteIndexedElement(this.observers, this)
  }
}