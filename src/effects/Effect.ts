import GameObject, {
  ActiveGameObjectEvent, GameObjectChildEventListener, GameObjectEventListener,
  GameObjectEvents,
} from '../GameObject'
import { serializable } from '../serialize'
import { runEffectIn } from '../behavior/core'

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

  on<T extends keyof GameObjectEvents> (
      obj: GameObject, event: T, listener: GameObjectEventListener<T>) {
    return this.registerEvent(obj.on(event, listener))
  }

  onChildren<T extends keyof GameObjectEvents> (
      obj: GameObject, event: T, listener: GameObjectChildEventListener<T>) {
    return this.registerEvent(obj.onChildren(event, listener))
  }

  onObject<T extends keyof GameObjectEvents> (
      event: T, listener: GameObjectEventListener<T>) {
    return this.on(this.object, event, listener)
  }

  onObjectChildren<T extends keyof GameObjectEvents> (
      event: T, listener: GameObjectChildEventListener<T>) {
    return this.onChildren(this.object, event, listener)
  }

  // used when turning on the event after loading a save
  passiveActivation () {
    this.isActive = true
    this.events?.()
  }

  activate () {
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

  setObject (object: GameObject) {
    this.deactivate()
    this.object = object
    this.activate()
  }

  protected runTickIn (seconds: number) {
    runEffectIn(this, seconds)
  }

  private registerEvent (event: ActiveGameObjectEvent) {
    if (!this.eventList) {
      this.eventList = []
    }
    this.eventList.push(event)
    return event
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