import Entity from '../Entity.ts'
import { serializable } from '../util/serialize.ts'
import { runEffectIn } from '../logic/gameLoop'
import {
  ActiveEntityEvent, EntityEvent, EntityEventObserver,
} from '../EntityEvents.ts'
import {
  addIndexedElement, deleteIndexedElement, IndexedArrayElement,
} from '../util/util.ts'

// Effects are bound to an entity
// When the entity is destroyed, the effect is automatically cleaned up.
export default class Effect implements IndexedArrayElement {
  _index: number
  entity: Entity
  isActive = false
  eventList?: ActiveEntityEvent[]

  events? (): void

  onActivate? (): void

  onDeactivate? (): void

  run? (): void

  // used when turning on the event after loading a save
  activatePassively () {
    this.isActive = true
    if (this.events) {
      this.eventList = []
      this.events()
    }
    return this
  }

  activate (entity: Entity) {
    if (this.isActive) {
      return this
    }

    this.entity = entity

    if (!this.entity.effects) {
      this.entity.effects = []
    }

    addIndexedElement(this.entity.effects, this)

    this.activatePassively()

    this.onActivate?.()

    return this
  }

  deactivate () {
    if (!this.isActive) {
      return this
    }

    this.isActive = false

    deleteIndexedElement(this.entity.effects!, this)

    if (this.eventList) {
      for (const event of this.eventList) {
        event.unsubscribe()
      }
    }

    this.onDeactivate?.()

    return this
  }

  runIn (seconds: number) {
    runEffectIn(this, seconds)
  }

  replaceWith (effect: Effect) {
    this.deactivate()
    effect.activate(this.entity)
  }

  setEntity (entity: Entity) {
    this.deactivate()
    this.activate(entity)
  }

  protected on<T extends EntityEvent> (
      entity: Entity, event: T, observer: EntityEventObserver<T>) {
    return this.registerEvent(entity.on(event, observer))
  }

  protected onChildren<T extends EntityEvent> (
      entity: Entity, event: T, observer: EntityEventObserver<T>) {
    return this.registerEvent(entity.onChildren(event, observer))
  }

  protected onEntity<T extends EntityEvent> (
      event: T, observer: EntityEventObserver<T>) {
    return this.on(this.entity, event, observer)
  }

  protected onEntityChildren<T extends EntityEvent> (
      event: T, observer: EntityEventObserver<T>) {
    return this.onChildren(this.entity, event, observer)
  }

  private registerEvent (event: ActiveEntityEvent) {
    this.eventList!.push(event)
    return event
  }
}

serializable(Effect, {
  transform: {
    entity: serializable.ignore, // added back in Game class
    eventList: serializable.ignore,
    isActive: serializable.ignore,
  },
})

export function removeEffects (entity: Entity) {
  if (entity.effects) {
    for (let i = entity.effects.length - 1; i >= 0; i--) {
      entity.effects[i].deactivate()
    }
  }
}