import { makeOrGet, mapFilter } from './util'
import { Constructor } from './types'

// Serializes a complex object into a JSON string.
// Deserializing returns the original object
// Supports references to shared objects, and circular references
// Classes are preserved

interface SerializableOptions<T> {
  // Maps an object key's value to a user-defined output before serialization
  // If returns undefined, the key is not serialized
  transform?: {
    [prop in keyof T]?: ((value: T[prop]) => any) |
      [(value: T[prop]) => any, ((value: any) => T[prop])]
  }
  // Called on each object after the object is reconstructed
  afterDeserialize?: (object: T) => void
}

let nextConstructorId = 1
const idToConstructor = new Map<number, Constructor>()
const constructorToId = new WeakMap<Constructor, number>()

const constructorToTransform = new WeakMap<Constructor,
    SerializableOptions<any>['transform']>()
const constructorToDeserializeCallback = new WeakMap<Constructor,
    SerializableOptions<any>['afterDeserialize']>()

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

serializable.ignore = () => undefined

export function serialize (toSerialize: any) {
  const sharedObjects = new SharedObjects()

  // Recurse through the object to find all references to shared objects
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
      const $s = mapFilter(object, value => prepare(value))
      return $s.length ? { $s } : undefined
    } else if (object instanceof Map) {
      const $m = mapFilter(object,
          ([key, value]) => [prepare(key), prepare(value)])
      return $m.length ? { $m } : undefined
    } else if (Array.isArray(object)) {
      const mapped = mapFilter(object, value => prepare(value))
      return mapped.length ? mapped : undefined
    } else if (object.constructor === Object) {
      return prepareObjectLiteral(object)
    } else {
      return prepareInstance(object)
    }
  }

  function prepareObjectLiteral (object: any) {
    const copy: any = {}
    for (const key in object) {
      copy[key] = prepare(object[key])
    }
    return copy
  }

  function prepareInstance (object: any) {
    let copy: any = {}

    const id = constructorToId.get(object.constructor)
    if (!id) {
      if (object.constructor.name) {
        console.warn(`To serialize`, object, `pass class to 'serializable'`)
      }
      return // is an anonymous class that will be ignored
    }

    let i = 0
    for (const key in object) {
      const encodedKey = getPropEncoding(i++)
      const value = object[key]
      const transform = getTransformToFn(object, key)
      const transformed =
          transform && value !== undefined ? transform(value) : value

      const prepared = prepare(transformed)

      if (prepared !== undefined) {
        copy[encodedKey] = prepared
      }
    }

    // Store the constructor's mapped id in the serialized string so that we can
    // reconstruct the instance for deserialization
    copy.$c = id

    return copy
  }

  const toStringify = {
    object: prepare(toSerialize),
    shared: mapFilter(sharedObjects.usedSharedObjects,
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

  function revive (value: any, copy?: any) {
    if (typeof value === 'string' && value[0] === '→') {
      return sharedRevived[parseFloat(value.slice(1))]
    } else if (isPrimitive(value)) {
      return value
    }

    copy = copy ?? instantiateFromTemplate(value)

    if (copy instanceof Set) {
      for (const item of value.$s) {
        copy.add(revive(item))
      }
    } else if (copy instanceof Map) {
      for (const [key, item] of value.$m) {
        copy.set(revive(key), revive(item))
      }
    } else if (copy.constructor === Object || Array.isArray(copy)) {
      for (const key in value) {
        copy[key] = revive(value[key])
      }
    } else {
      const propEncoding = getPropEncodingMap(copy)
      for (const encodedKey in value) {
        if (encodedKey[0] === '$') {
          continue
        }
        const revived = revive(value[encodedKey])
        const key = propEncoding[encodedKey]
        const transform = getTransformFromFn(copy, key)
        copy[key] = transform?.(revived) ?? revived
      }
      constructorToDeserializeCallback.get(copy.constructor)?.(copy)
    }

    return copy
  }

  for (let i = 0; i < shared.length; i++) {
    revive(shared[i], sharedRevived[i])
  }

  return revive(object)
}

function instantiateFromTemplate (object: any) {
  if (object.$c) {
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

// The function that maps to the serialized form
function getTransformToFn (object: any, key: string) {
  const transform = constructorToTransform.get(object.constructor)?.[key]
  return Array.isArray(transform) ? transform[0] : transform
}

// The function that maps from the serialized form back to the original form
function getTransformFromFn (object: any, key: string) {
  const transform = constructorToTransform.get(object.constructor)?.[key]
  return Array.isArray(transform) ? transform[1] : undefined
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
  // Use set instead of array
  // This allows for iterating over set while adding extra elements via
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

const propEncoding = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'
const propEncodingMaps = new WeakMap<Constructor, any>()

// Property names are long and unnecessary to store in json.
// We can map each property to a single character,
// according to the order the property is access using the 'in' operator.
function getPropEncoding (i: number) {
  if (i >= propEncoding.length) {
    throw new Error('Your class has more props than serialize supports.')
  }
  return propEncoding[i]
}

function getPropEncodingMap (object: any) {
  return makeOrGet(propEncodingMaps, object.constructor, () => {
    const propMap: any = {}
    let i = 0
    for (const key in object) {
      propMap[getPropEncoding(i++)] = key
    }
    return propMap
  })
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