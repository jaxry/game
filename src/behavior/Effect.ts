import GameObject, {
  ActiveGameObjectEvent, GameObjectEventListener, GameObjectEvents,
} from '../GameObject'
import { serializable } from '../serialize'
import { runEffectIn } from './core'

export default class Effect {
  // The object associated with the effect.
  // When the object is destroyed, the effect is automatically cleaned up.
  object: GameObject
  isActive = false
  eventList?: ActiveGameObjectEvent[]

  constructor (object: GameObject) {
    this.object = object
  }

  events? (): void

  onActivate? (): void

  onDeactivate? (): void

  tick? (): void

  protected tickIn (seconds: number) {
    runEffectIn(this, seconds)
  }

  // Adds a GameObject event that is automatically cleaned up when the effect
  // is deactivated
  on<T extends keyof GameObjectEvents> (
      obj: GameObject, event: T, listener: GameObjectEventListener<T>) {
    if (!this.eventList) {
      this.eventList = []
    }

    const activeEvent = obj.on(event, listener)
    this.eventList.push(activeEvent)

    return activeEvent
  }

  onObject<T extends keyof GameObjectEvents> (
      event: T, listener: GameObjectEventListener<T>) {
    return this.on(this.object, event, listener)
  }

  onContainer<T extends keyof GameObjectEvents> (
      event: T, listener: GameObjectEventListener<T>) {
    return this.on(this.object.container, event, listener)
  }

  // used when turning on the event after loading a save
  passiveActivation () {
    this.isActive = true
    this.events?.()
  }

  activate (reviveOnly = false) {
    if (this.isActive) {
      return this
    }

    this.passiveActivation()

    if (!this.object.effects) {
      this.object.effects = new Set()
    }

    this.object.effects.add(this)

    this.onActivate?.()

    return this
  }

  deactivate () {
    if (!this.isActive) {
      return this
    }

    this.isActive = false

    this.object.effects.delete(this)

    if (this.eventList) {
      for (const event of this.eventList) {
        event.unsubscribe()
      }
      this.eventList.length = 0
    }

    this.onDeactivate?.()

    return this
  }

  reregisterEvents () {
    if (this.eventList) {
      for (const event of this.eventList) {
        event.unsubscribe()
      }
      this.eventList.length = 0
    }

    this.events?.()
  }

  reactivate () {
    this.reregisterEvents()
    this.onActivate?.()
  }

  setObject (object: GameObject) {
    this.deactivate()
    this.object = object
    this.activate()
  }
}

serializable(Effect, {
  transform: {
    object: serializable.ignore, // added back in Game class
    eventList: serializable.ignore,
    isActive: serializable.ignore,
  },
})

export function removeEffects (obj: GameObject) {
  if (obj.effects) {
    for (const effect of obj.effects) {
      effect.deactivate()
    }
    obj.effects.clear()
  }
}