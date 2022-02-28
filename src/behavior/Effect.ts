import type { GameObject, ActiveObjectEvent } from '../GameObject'
import { unsubscribeEvent } from '../GameObject'
import type { ObjectEventCallback, ObjectEvents } from '../GameObjectType'
import { deleteElem } from '../util'

export class Effect {
  static effectName?: string
  get name() {
    return (this.constructor as typeof Effect).effectName ??
        this.constructor.name
  }

  static tickPriority = 1
  get tickPriority() {
    return (this.constructor as typeof Effect).tickPriority
  }

  object: GameObject

  isActive = false

  private events?: ActiveObjectEvent[]

  constructor(object: GameObject) {
    this.object = object
  }

  tick?(): void

  onActivate?(): void

  onDeactivate?(): void

  onEvent<T extends keyof ObjectEvents>(
      obj: GameObject, event: T, listener: ObjectEventCallback<T>) {
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

  unsubscribe(event: ActiveObjectEvent) {
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

    const isEffectInGameLoop = effectsCallback.removeEffectFromGameLoop(this)

    if (this.tick && !isEffectInGameLoop) {
      deleteElem(queuedTickEffects, this)
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