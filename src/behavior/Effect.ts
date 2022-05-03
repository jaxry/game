import type { ActiveGameObjectEvent, GameObject } from '../GameObject'
import { unsubscribeEvent } from '../GameObject'
import type {
  GameObjectEventCallback,
  GameObjectEvents,
} from '../GameObjectType'
import { deleteElem } from '../util'

export class Effect {
  // From 0 to a positive integer.
  // The lower the number, the sooner the effect's tick method
  // is called in the game loop.
  static tickPriority = 1

  // The object associated with the effect.
  // When the object is destroyed, the effect is automatically cleaned up.
  object: GameObject
  isActive = false
  private events?: ActiveGameObjectEvent[]

  constructor(object: GameObject) {
    this.object = object
  }

  get name() {
    return this.constructor.name
  }

  get tickPriority() {
    return (this.constructor as typeof Effect).tickPriority
  }

  // called once every game loop (every second)
  tick?(): void

  onActivate?(): void

  onDeactivate?(): void

  // Adds a GameObject event that is automatically cleaned up when the effect
  // is deactivated
  onEvent<T extends keyof GameObjectEvents>(
      obj: GameObject, event: T, listener: GameObjectEventCallback<T>) {
    if (!this.isActive) {
      console.warn(this, 'must be activated before subscribing to events')
      return undefined as never
    }

    if (!this.events) {
      this.events = []
    }

    const unsub = obj.on(event, listener)
    this.events.push(unsub)

    return unsub
  }

  unsubscribe(event: ActiveGameObjectEvent) {
    unsubscribeEvent(event)
    deleteElem(this.events!, event)
  }

  activate() {
    if (this.isActive) {
      return this
    }

    this.isActive = true

    if (this.tick) {
      queuedTickEffects.push(this)
    }

    if (!this.object.effects) {
      this.object.effects = []
    }

    this.object.effects.push(this)

    this.onActivate?.()

    return this
  }

  deactivate(destroyedObject = false) {
    if (!this.isActive) {
      return this
    }

    this.isActive = false

    if (this.tick) {
      const isEffectInGameLoop = effectsCallback.removeEffectFromGameLoop(this)
      if (!isEffectInGameLoop) {
        deleteElem(queuedTickEffects, this)
      }
    }

    if (!destroyedObject) {
      // no need to remove effect from object if object is destroyed
      deleteElem(this.object.effects, this)
    }

    if (this.events) {
      for (const event of this.events) {
        if (!destroyedObject || event.obj !== this.object) {
          // no need to unsubscribe if object is destroyed
          unsubscribeEvent(event)
        }
      }
      this.events.length = 0
    }

    this.onDeactivate?.()

    return this
  }

  reactivate() {
    this.deactivate().activate()
  }
}

export function removeEffects(obj: GameObject) {
  if (obj.effects) {
    for (const effect of obj.effects) {
      effect.deactivate(true)
    }
    obj.effects.length = 0
  }
}

export const queuedTickEffects: Effect[] = []

export function addQueuedEffectsToGameLoop(fn: (effects: Effect) => void) {
  for (const effect of queuedTickEffects) {
    fn(effect)
  }
  queuedTickEffects.length = 0
}

// set outside this module
export const effectsCallback = {
  removeEffectFromGameLoop: (effect: Effect) => false,
}