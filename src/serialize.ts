import { mapIter } from './util'
import { Constructor } from './types'

let nextConstructorId = 1
const idToConstructor = new Map<number, Constructor>()
const constructorToId = new Map<Constructor, number>()

const constructorToTransform = new WeakMap<Constructor,
    SerializableOptions<any>['transform']>()
const constructorToDeserializeCallback = new WeakMap<Constructor,
    SerializableOptions<any>['afterDeserialize']>()

export interface SerializableOptions<T> {
  // transform a key value to a simple, jsonable result
  transform?: {
    [prop in keyof T]?: [(value: T[prop]) => any, ((value: any) => T[prop])?]
  }
  afterDeserialize?: (object: T) => void
}

export const ignoreIfEmpty = [
  (x: Map<unknown, unknown> | Set<unknown>) => x.size > 0 ? x : undefined,
] as any

export const transformIgnore = [() => undefined] as any

export function serializable<T> (
    constructor: Constructor<T>, options?: SerializableOptions<T>) {

  const id = nextConstructorId++
  idToConstructor.set(id, constructor)
  constructorToId.set(constructor, id)

  addInheritedProperty(constructor, constructorToTransform,
      (transform, parentTransform) => {
        return parentTransform ? { ...parentTransform, ...transform } :
            transform
      }, options?.transform)

  addInheritedProperty(constructor, constructorToDeserializeCallback,
      (callback, parentCallback) => {
        return parentCallback ?
            combineFunctions(parentCallback, callback) : callback
      }, options?.afterDeserialize)
}

export function serialize (toSerialize: any) {
  const sharedObjects = new SharedObjects()

  sharedObjects.find(toSerialize)

  function prepare (value: any, makeSharedReference = true): any {
    if (isPrimitive(value)) {
      return value
    }
    const object = value

    const sharedId = makeSharedReference && sharedObjects.getId(object)
    if (sharedId !== false) {
      return `→${sharedId}`
    }

    if (object instanceof Set) {
      return {
        $s: mapIter(object, value => prepare(value)),
      }
    } else if (object instanceof Map) {
      return {
        $m: mapIter(object, ([key, value]) => {
          return [prepare(key), prepare(value)]
        }),
      }
    } else if (Array.isArray(object)) {
      return mapIter(object, value => prepare(value))
    } else {
      return prepareKeyedObject(object)
    }
  }

  function prepareKeyedObject (object: any) {
    let copy: any = {}

    if (object.constructor !== Object) {
      const id = constructorToId.get(object.constructor)
      if (!id) {
        if (object.constructor.name) {
          console.warn(`To serialize`, object, `pass class to 'serializable'`)
        }
        return
      }
      copy.$c = id
    }

    for (const key in object) {
      const value = object[key]
      const transform =
          constructorToTransform.get(object.constructor)?.[key]?.[0]
      const transformed =
          transform && value !== undefined ? transform(value) : value

      const prepared = prepare(transformed)

      if (prepared !== undefined) {
        copy[key] = prepared
      }
    }

    return copy
  }

  const toStringify = {
    object: prepare(toSerialize),
    shared: mapIter(sharedObjects.usedSharedObjects,
        (object) => prepare(object, false)),
  }

  return JSON.stringify(toStringify)
}

export function deserialize (json: string) {
  const { object, shared } = JSON.parse(json)

  // Instantiate all shared objects at once.
  // This allows for circular references when the instances are
  // later populated with props.
  const sharedRevived = shared.map((object: any) => {
    return instantiateFromTemplate(object)
  })

  function revive (value: any, copy: any = instantiateFromTemplate(value)) {
    if (typeof value === 'string' && value[0] === '→') {
      return sharedRevived[parseFloat(value.slice(1))]
    } else if (isPrimitive(value)) {
      return value
    }

    if (copy instanceof Set) {
      for (const item of value.$s) {
        copy.add(revive(item))
      }
    } else if (copy instanceof Map) {
      for (const [key, item] of value.$m) {
        copy.set(revive(key), revive(item))
      }
    } else {
      for (const key in value) {
        if (key[0] === '$') {
          continue
        }
        const revived = revive(value[key])
        const transform = constructorToTransform.get(copy.constructor)
        copy[key] = transform?.[key]?.[1]?.(revived) ?? revived
      }
    }

    constructorToDeserializeCallback.get(copy.constructor)?.(copy)

    return copy
  }

  for (let i = 0; i < shared.length; i++) {
    revive(shared[i], sharedRevived[i])
  }

  return revive(object)
}

function instantiateFromTemplate (object: any) {
  if (isPrimitive(object)) {
    return
  } else if (object.$c) {
    const Constructor = idToConstructor.get(object.$c)!
    return new Constructor()
  } else if (Array.isArray(object)) {
    return []
  } else if (object.$s) {
    return new Set()
  } else if (object.$m) {
    return new Map()
  } else {
    return {}
  }
}

function addInheritedProperty<T, K> (
    constructor: Constructor,
    constructorToProp: WeakMap<Constructor, K>,
    transform: (prop: T, parentProp?: K) => K, property?: T) {

  const parentProp = findParentInMap(constructor, constructorToProp)

  if (parentProp && property === undefined) {
    constructorToProp.set(constructor, parentProp)
  } else if (property !== undefined) {
    const transformed = transform(property, parentProp)
    constructorToProp.set(constructor, transformed)
  }
}

function findParentInMap<T> (
    constructor: Constructor, map: WeakMap<Constructor, T>) {

  let parent = Object.getPrototypeOf(constructor)

  while (parent?.name) {
    if (map.has(parent)) {
      return map.get(parent)
    }
    parent = Object.getPrototypeOf(parent)
  }
}

class SharedObjects {
  // use set instead of array
  // this allows for iterating over set while adding extra elements via
  // more calls to this.getId
  usedSharedObjects = new Set<any>()

  private objectSet = new WeakSet<any>()
  private sharedObjects = new WeakMap<any, number>()

  find (object: any) {
    if (isPrimitive(object)) {
      return
    }

    if (this.objectSet.has(object)) {
      this.sharedObjects.set(object, -1)
      return
    }

    if (object instanceof Set || object instanceof Array) {
      this.objectSet.add(object)
      for (const value of object) {
        this.find(value)
      }
    } else if (object instanceof Map) {
      this.objectSet.add(object)
      for (const [key, value] of object) {
        this.find(key)
        this.find(value)
      }
    } else if (object.constructor === Object ||
        constructorToId.has(object.constructor)) {
      // don't consider Function objects
      // or classes without a serializable call

      this.objectSet.add(object)

      for (const key in object) {
        this.find(object[key])
      }
    }
  }

  getId (object: any) {
    let id = this.sharedObjects.get(object)

    if (id === undefined) {
      return false
    }

    if (id === -1) {
      id = this.usedSharedObjects.size
      this.sharedObjects.set(object, id)
      this.usedSharedObjects.add(object)
    }

    return id
  }
}

function isPrimitive (value: any) {
  return value === null || typeof value !== 'object'
}

type Args<T> = (...args: T[]) => void

function combineFunctions<T> (fn1: Args<T>, fn2: Args<T>): Args<T> {
  return (...args) => {
    fn1(...args)
    fn2(...args)
  }
}
