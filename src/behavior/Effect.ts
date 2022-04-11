import type { ActiveGameObjectEvent, GameObject } from '../GameObject'
import { unsubscribeEvent } from '../GameObject'
import type {
  GameObjectEventCallback,
  GameObjectEvents,
} from '../GameObjectType'
import { deleteElem } from '../util'

export class Effect {
  static effectName?: string
  static tickPriority = 1
  object: GameObject
  isActive = false
  private events?: ActiveGameObjectEvent[]

  constructor(object: GameObject) {
    this.object = object
  }

  get name() {
    return (this.constructor as typeof Effect).effectName ??
        this.constructor.name
  }

  get tickPriority() {
    return (this.constructor as typeof Effect).tickPriority
  }

  tick?(): void

  onActivate?(): void

  onDeactivate?(): void

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
      console.warn(this, 'already activated')
      return
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