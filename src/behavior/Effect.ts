import GameObject, {
  ActiveGameObjectEvent, GameObjectEventListener, GameObjectEvents,
} from '../GameObject'
import { serializable, transformIgnore } from '../serialize'
import { addEffectToGameLoop, removeEffectFromGameLoop } from './core'

export default class Effect {
  // From 0 to a positive integer.
  // The lower the number, the sooner the effect's tick method
  // is called in the game loop.
  static tickPriority = 1

  // The object associated with the effect.
  // When the object is destroyed, the effect is automatically cleaned up.
  object: GameObject
  isActive = false
  eventList?: ActiveGameObjectEvent[]

  constructor (object: GameObject) {
    this.object = object
  }

  get name () {
    return this.constructor.name
  }

  get tickPriority () {
    return (this.constructor as typeof Effect).tickPriority
  }

  // called once every game loop (every second)
  tick? (): void

  events? (): void

  onActivate? (): void

  onDeactivate? (): void

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

  passiveActivation () {
    this.isActive = true

    if (this.tick) {
      addEffectToGameLoop(this)
    }

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

    if (this.tick) {
      removeEffectFromGameLoop(this)
    }

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
    object: transformIgnore, // added back in Game class
    eventList: transformIgnore,
    isActive: transformIgnore,
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