import { mapIter } from './util'
import { Constructor } from './types'

let nextConstructorId = 1
const idToConstructor = new Map<number, Constructor<any>>()
const constructorToId = new Map<Constructor<any>, number>()

const constructorToIgnoreSet = new WeakMap<Constructor<any>, Set<string>>()
const constructorToTransform = new WeakMap<Constructor<any>,
    SerializableOptions<any>['transform']>()
const constructorToDeserializeCallback = new WeakMap<Constructor<any>,
        SerializableOptions<any>['afterDeserialize']>()

export interface SerializableOptions<T> {
  ignore?: (keyof T)[]
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
    if (typeof value !== 'object' || value === null) {
      return value
    }

    const object = value

    if (makeSharedReference && sharedObjects.has(object)) {
      return `→${sharedObjects.get(object)}`
    }

    if (object instanceof Set) {
      return {
        '$set': mapIter(object, value => prepare(value)),
      }
    } else if (object instanceof Map) {
      return {
        '$map': mapIter(object, ([key, value]) => {
          const pKey = prepare(key)
          const pValue = prepare(value)
          if (pKey !== undefined && pValue !== undefined) {
            return [pKey, pValue]
          }
        }),
      }
    } else if (Array.isArray(object)) {
      return mapIter(object, value => prepare(value))
    }

    const copy: any = {}

    if (object.constructor !== Object) {
      const id = constructorToId.get(object.constructor)
      if (!id) {
        // don't save classes that don't have serializable() called on them
        return
      }
      copy['$class'] = id
    }

    const ignoreSet = constructorToIgnoreSet.get(object.constructor)

    for (const key in object) {
      if (ignoreSet?.has(key)) {
        continue
      }
      const value = object[key]
      const transform = constructorToTransform.get(object.constructor)
      const prepared = prepare(transform?.[key]?.[0](value) ?? value)
      if (prepared !== undefined) {
        copy[key] = prepared
      }
    }

    return copy
  }

  return JSON.stringify({
    shared: mapIter(sharedObjects.keys(), (object) => prepare(object, false)),
    object: prepare(toSerialize, true),
  })
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
    } else if (typeof value !== 'object' || value === null) {
      return value
    }

    if (copy instanceof Set) {
      for (const item of value['$set']) {
        copy.add(revive(item))
      }
    } else if (copy instanceof Map) {
      for (const [key, item] of value['$map']) {
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
  if (object['$class']) {
    const Constructor = idToConstructor.get(object['$class'])!
    return new Constructor()
  } else if (Array.isArray(object)) {
    return []
  } else if (object['$set']) {
    return new Set()
  } else if (object['$map']) {
    return new Map()
  } else {
    return {}
  }
}

function addInheritedProperty<T, K> (
    constructor: Constructor<any>,
    constructorToProp: WeakMap<Constructor<any>, K>,
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
    constructor: Constructor<any>, map: WeakMap<Constructor<any>, T>) {

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
    if (typeof value !== 'object' || value === null) {
      return
    }

    const object = value

    if (objectSet.has(object)) {
      sharedObjects.add(object)
      return
    }

    objectSet.add(object)

    if (object instanceof Set) {
      for (const value of object) {
        findShared(value)
      }
    } else if (object instanceof Map) {
      for (const [key, value] of object) {
        findShared(key)
        findShared(value)
      }
    } else {
      if (object.constructor !== Object &&
          !constructorToId.has(object.constructor)) {
        return
      }

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

const sharey = { iAmShared: true }
const sharey2 = { iAmShared: false }

const circ1: any = { name: 'circular1' }
const circ2: any = { name: 'circular2' }
circ1.r = circ2
circ2.r = circ1

const setThing = new Set([1, 2, sharey2])

const mapper = new Map<any, any>()
mapper.set('a', sharey)
mapper.set(setThing, 'hi hi you you')
mapper.set({ hey: 'thing' }, 5)

class IgnoreMe {
  prop = 'this class shouldnt be here'
}

class AClass {
  sharey = sharey
  sharey2 = sharey2
  setThing1 = setThing
  mapper = mapper
  aClassIgnore = 'bye'
  d?: AClass
  a!: string

  manOhMan () {
    console.log('man')
  }
}

serializable(AClass, {
  ignore: ['aClassIgnore'],
  afterDeserialize: (object) => {
    console.log('base doing', object)
  },
})

const ignoreMe = new IgnoreMe()

class BClass extends AClass {
  circular = circ1
  setThing2 = setThing
  bClassIgnore = 'nothing'
  f = { thing: 'here and there' }
  array = ['does this', sharey, ignoreMe, ignoreMe]

  constructor () {
    super()

    // const a = new AClass()
    // a.d = this
    // this.d = a
  }

  thingDude () {
    console.log('thing')
  }
}

serializable(BClass, {
  ignore: ['bClassIgnore'],
  transform: {
    'f': [
        (f) => f.thing,
        (f: any) => ({ thing: f})]
  },
  afterDeserialize: (object) => {
    console.log('done it', object)
  }

})

const bThing = new BClass()
bThing.a = 'hihihi'
bThing.f = { thing: 'another guy' }

const before = { thing: bThing }

const json = serialize(before)
console.log(json)
const after = deserialize(json)

// setTimeout(() => {
console.log(before, after)
// }, 10000)

