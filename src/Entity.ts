import Effect from './effects/Effect'
import { serializable } from './util/serialize.ts'
import { entityChildren } from './logic/container'
import { addCell } from './logic/grid.ts'
import {
  ActiveEntityEvent, EntityEvent, EntityEventMap, EntityEventObserver,
  EntityEvents,
} from './EntityEvents.ts'
import { Action } from './effects/actions/action.ts'
import { addIndexedElement, IndexedArrayElement } from './util/util.ts'

export default class Entity implements IndexedArrayElement {
  _index: number

  parent: Entity
  children?: Entity[]

  events?: EntityEventMap
  childEvents?: EntityEventMap

  effects?: Effect[]

  name?: string

  gridCells?: Map<number, Entity>
  gridPosition?: { x: number, y: number }

  cardPosition?: { x: number, y: number }

  activeAction?: Action

  materializer?: boolean

  on<T extends EntityEvent> (
      event: T,
      observer: EntityEventObserver<T>): ActiveEntityEvent<T> {
    if (!this.events) {
      this.events = new EntityEvents() as {}
    }
    if (!this.events[event]) {
      this.events[event] = []
    }

    const active = new ActiveEntityEvent(this.events[event]!, observer)
    addIndexedElement(this.events[event]!, active)
    return active
  }

  onChildren<T extends EntityEvent> (
      event: T,
      observer: EntityEventObserver<T>): ActiveEntityEvent<T> {
    if (!this.childEvents) {
      this.childEvents = new EntityEvents() as {}
    }
    if (!this.childEvents[event]) {
      this.childEvents[event] = []
    }

    const active = new ActiveEntityEvent(this.childEvents[event]!, observer)
    addIndexedElement(this.childEvents[event]!, active)
    return active
  }

  emit<T extends keyof EntityEvents> (
      event: T, ...data: EntityEvents[T]) {
    const observers = this.events?.[event]
    if (observers) {
      // reverse iteration so newly added events are not called in the same loop
      for (let i = observers.length - 1; i >= 0; i--) {
        observers[i].observer(this, ...data)
      }
    }
    const childObservers = this.parent.childEvents?.[event]
    if (childObservers) {
      for (let i = childObservers.length - 1; i >= 0; i--) {
        childObservers[i].observer(this, ...data)
      }
    }
  }
}

serializable(Entity, {
  transform: {
    events: serializable.ignore,
    childEvents: serializable.ignore,
    parent: serializable.ignore,
    gridCells: serializable.ignore,

    children: serializable.ignoreIfEmpty,
    effects: serializable.ignoreIfEmpty,
  },
})

export function initEntityAfterLoad (entity: Entity) {
  // TODO: add _index props
  if (entity.effects) {
    for (const effect of entity.effects) {
      effect.entity = entity
      effect.activatePassively()
    }
  }

  entityChildren(entity, (child) => {
    child.parent = entity
    if (child.gridPosition) {
      addCell(entity, child, child.gridPosition.x, child.gridPosition.y)
    }
    initEntityAfterLoad(child)
  })
}
