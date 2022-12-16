import { mapIter } from './util'
import { Constructor } from './types'

let nextConstructorId = 1
const idToConstructor = new Map<number, Constructor>()
const constructorToId = new Map<Constructor, number>()

const constructorToIgnoreSet = new WeakMap<Constructor, Set<string>>()
const constructorToTransform = new WeakMap<Constructor,
    SerializableOptions<any>['transform']>()
const constructorToDeserializeCallback = new WeakMap<Constructor,
        SerializableOptions<any>['afterDeserialize']>()

export interface SerializableOptions<T> {
  ignore?: (keyof T)[]

  // transform a key value to a simple, jsonable result
  transform?: {
    [prop in keyof T]?: [(value: T[prop]) => any, (value: any) => T[prop]] |
      [(value: T[prop]) => any]
  }
  afterDeserialize?: (object: T) => void
}

export function serializable<T> (
    constructor: Constructor<T>, options?: SerializableOptions<T>) {

  idToConstructor.set(nextConstructorId, constructor)
  constructorToId.set(constructor, nextConstructorId)
  nextConstructorId++

  addInheritedProperty(constructor, constructorToIgnoreSet,
      (ignore, parentSet) => {
        const set = parentSet ? new Set(parentSet) : new Set<string>()
        for (const key of ignore) {
          set.add(key as string)
        }
        return set
      }, options?.ignore)

  addInheritedProperty(constructor, constructorToDeserializeCallback,
      (callback, parentCallback) => {
        return parentCallback ?
            combineFunctions(parentCallback, callback) : callback
      }, options?.afterDeserialize)

  addInheritedProperty(constructor, constructorToTransform,
      (transform, parentTransform) => {
        return parentTransform ? {...parentTransform, ...transform} : transform
      }, options?.transform)
}

export function serialize (toSerialize: any) {
  const sharedObjects = getSharedObjects(toSerialize)

  function prepare (value: any, makeSharedReference = true): any {
    if (isPrimitive(value)) {
      return value
    }
    const object = value

    if (makeSharedReference && sharedObjects.has(object)) {
      return `→${sharedObjects.get(object)}`
    }

    if (object instanceof Set) {
      return {
        $s: mapIter(object, value => prepare(value)),
      }
    } else if (object instanceof Map) {
      return {
        $m: mapIter(object, ([key, value]) => {
          const pKey = prepare(key)
          const pValue = prepare(value)
          if (pKey !== undefined && pValue !== undefined) {
            return [pKey, pValue]
          }
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
        // don't save classes that don't have serializable() called on them
        console.warn('Cannot save', object)
        return
      }
      copy.$c = id
    }

    const ignoreSet = constructorToIgnoreSet.get(object.constructor)

    for (const key in object) {
      if (ignoreSet?.has(key)) {
        continue
      }
      const value = object[key]
      const transform = constructorToTransform.get(object.constructor)
          ?.[key]?.[0]
      const transformed = transform && value ? transform(value) : value
      const prepared = prepare(transformed)
      if (prepared !== undefined) {
        copy[key] = prepared
      }
    }

    return copy
  }

  const toStringify = {
    shared: mapIter(sharedObjects.keys(), (object) => prepare(object, false)),
    object: prepare(toSerialize, true),
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

  const deserialized = revive(object)

  return deserialized
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


type Args<T> = (...args: T[]) => void
function combineFunctions<T> (fn1: Args<T>, fn2: Args<T>): Args<T> {
  return (...args) => {
    fn1(...args)
    fn2(...args)
  }
}

function getSharedObjects (object: any) {
  const objectSet = new Set<any>()
  const sharedObjects = new Set<any>()

  function findShared (value: any) {
    if (isPrimitive(value)) {
      return
    }

    const object = value

    if (objectSet.has(object)) {
      sharedObjects.add(object)
      return
    }

    if (object instanceof Set || object instanceof Array) {
      objectSet.add(object)
      for (const value of object) {
        findShared(value)
      }
    } else if (object instanceof Map) {
      objectSet.add(object)
      for (const [key, value] of object) {
        findShared(key)
        findShared(value)
      }
    } else if (object.constructor === Object ||
        constructorToId.has(object.constructor)) {

      objectSet.add(object)

      const ignoreSet = constructorToIgnoreSet.get(object.constructor)

      for (const key in object) {
        if (ignoreSet?.has(key)) {
          continue
        }
        findShared(object[key])
      }
    }
  }

  findShared(object)

  const sharedObjectToId = new Map<any, number>()
  let id = 0
  for (const object of sharedObjects) {
    sharedObjectToId.set(object, id++)
  }

  return sharedObjectToId
}

function isPrimitive (value: any) {
  return value === null || typeof value !== 'object'
}
