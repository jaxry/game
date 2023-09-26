import { makeOrGet, mapFilter } from './util.ts'
import { Constructor } from './types.ts'

// Serializes a complex object into a JSON string.
// Deserializing returns the original object
// Supports references to shared objects, and circular references
// Classes are preserved
// To serialize a class, pass it to the 'serializable' function

interface SerializableOptions<T = any> {
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
    SerializableOptions['transform']>()
const constructorToDeserializeCallback = new WeakMap<Constructor,
    SerializableOptions['afterDeserialize']>()

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
serializable.ignoreIfEmpty =
    (value: Array<any> | Map<any, any> | Set<any> | undefined) => {
      let empty: boolean | undefined

      if (value instanceof Array) {
        empty = value.length === 0
      } else if (value instanceof Map || value instanceof Set) {
        empty = value.size === 0
      }

      return empty ? undefined : value
    }

export function serialize (toSerialize: any) {
  const sharedObjects = new SharedObjects()

  // Recurse through the object to find all references to shared objects
  sharedObjects.find(toSerialize)

  function prepare (value: any, makeSharedReference = true): any {
    if (isPrimitive(value)) {
      return value
    }

    const sharedIndex = makeSharedReference && sharedObjects.getIndex(value)

    if (sharedIndex !== false) {
      return { $r: sharedIndex }
    }

    if (value instanceof Set) {
      return {
        $s: mapFilter(value, x => prepare(x)),
      }
    } else if (value instanceof Map) {
      return {
        $m: mapFilter(value, ([key, x]) => [prepare(key), prepare(x)]),
      }
    } else if (Array.isArray(value)) {
      return mapFilter(value, x => prepare(x))
    } else if (value.constructor === Object) {
      return prepareObjectLiteral(value)
    } else if (constructorToId.has(value.constructor)) {
      return prepareInstance(value)
    } else if (value.prototype && constructorToId.has(value)) {
      return { $c: constructorToId.get(value) }
    }

    if (value.constructor?.name) {
      console.warn(value.constructor.name,
          `class needs to be passed to 'serializable'`)
    }
  }

  function prepareObjectLiteral (object: any) {
    const prepared: any = {}
    for (const key in object) {
      prepared[key] = prepare(object[key])
    }
    return prepared
  }

  function prepareInstance (object: any) {
    let prepared: any = {}

    let i = 0
    for (const key in object) {
      const encodedKey = getPropEncoding(i++)
      const value = object[key]
      const transform = getTransformToFn(object, key)
      const transformed =
          transform && value !== undefined ? transform(value) : value

      const preparedValue = prepare(transformed)

      if (preparedValue !== undefined) {
        prepared[encodedKey] = preparedValue
      }
    }

    // Store the constructor's mapped id in the serialized string so that we can
    // reconstruct the instance for deserialization
    prepared.$i = constructorToId.get(object.constructor)

    return prepared
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

  function revive (value: any, revived?: any) {
    if (isPrimitive(value)) {
      return value
    } else if (value.$r !== undefined) {
      return sharedRevived[value.$r]
    } else if (value.$c !== undefined) {
      return idToConstructor.get(value.$c)!
    }

    revived = revived ?? instantiateFromTemplate(value)

    if (revived instanceof Set) {
      for (const item of value.$s) {
        revived.add(revive(item))
      }
    } else if (revived instanceof Map) {
      for (const [key, item] of value.$m) {
        revived.set(revive(key), revive(item))
      }
    } else if (revived.constructor === Object || Array.isArray(revived)) {
      for (const key in value) {
        revived[key] = revive(value[key])
      }
    } else {
      const propEncoding = getPropEncodingMap(revived)
      for (const encodedKey in value) {
        if (encodedKey[0] === '$') continue

        const key = propEncoding[encodedKey]
        const revivedValue = revive(value[encodedKey])
        const transform = getTransformFromFn(revived, key)
        revived[key] = transform?.(revivedValue) ?? revivedValue
      }
      constructorToDeserializeCallback.get(revived.constructor)?.(revived)
    }

    return revived
  }

  for (let i = 0; i < shared.length; i++) {
    revive(shared[i], sharedRevived[i])
  }

  return revive(object)
}

function instantiateFromTemplate (object: any) {
  if (object.$i) {
    const Constructor = idToConstructor.get(object.$i)!
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
  // Set instead of array
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
      // Don't consider Function objects
      // or classes without a serializable call

      this.objectSet.add(object)

      for (const key in object) {
        this.find(object[key])
      }
    }
  }

  getIndex (object: any) {
    let index = this.sharedObjects.get(object)

    if (index === undefined) {
      return false
    }

    if (index === -1) {
      index = this.usedSharedObjects.size
      this.sharedObjects.set(object, index)
      this.usedSharedObjects.add(object)
    }

    return index
  }
}

const propEncodingMaps = new WeakMap<Constructor, any>()

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

// Property names are long and unnecessary to store in json.
// We can grid each property to a single character,
// according to the order the property is access using the 'in' operator.
const propEncoding =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function getPropEncoding (i: number) {
  let s = ''

  do {
    s += propEncoding[i % propEncoding.length]
    i = Math.floor(i / propEncoding.length)
  } while (i > 0)

  return s
}

function isPrimitive (value: any) {
  return value === null ||
      typeof value !== 'object' && typeof value !== 'function'
}

type Args<T> = (...args: T[]) => void

function combineFunctions<T> (fn1: Args<T>, fn2: Args<T>): Args<T> {
  return (...args) => {
    fn1(...args)
    fn2(...args)
  }
}