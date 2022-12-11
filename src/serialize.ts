import { mapIter } from './util'

type Constructor<T> = { new (...args: any[]): T }

let nextConstructorId = 1
const idToConstructor = new Map<number, Constructor<any>>()
const constructorToId = new Map<Constructor<any>, number>()

const constructorToIgnoreSet = new WeakMap<Constructor<any>, Set<string>>()
const constructorToAfterDeserialize =
    new WeakMap<
        Constructor<any>, SerializableOptions<any>['afterDeserialize']>()

export function serializable<T> (
    constructor: Constructor<T>, options?: SerializableOptions<T>) {

  idToConstructor.set(nextConstructorId, constructor)
  constructorToId.set(constructor, nextConstructorId)
  nextConstructorId++

  const parentIgnoreSet =
      findParentWithValue(constructor, constructorToIgnoreSet)

  if (parentIgnoreSet && !options?.ignore) {
    constructorToIgnoreSet.set(constructor, parentIgnoreSet)
  } else if (options?.ignore) {
    const set = parentIgnoreSet ? new Set(parentIgnoreSet) : new Set<string>()
    for (const key of options.ignore) {
      set.add(key as string)
    }
    constructorToIgnoreSet.set(constructor, set)
  }

  const parentCallback =
      findParentWithValue(constructor, constructorToAfterDeserialize)
  if (parentCallback && !options?.afterDeserialize) {
    constructorToAfterDeserialize.set(constructor, parentCallback)
  } else if (options?.afterDeserialize) {
    const callback = parentCallback ?
        combineFunctions(parentCallback, options.afterDeserialize) :
        options.afterDeserialize

    constructorToAfterDeserialize.set(constructor, callback)
  }
}

export interface SerializableOptions<T> {
  ignore?: (keyof T)[]
  beforeSerialize?: (object: T) => T | void
  afterDeserialize?: (object: T) => void
}

export function serialize (toSerialize: any) {
  const objectPool = makeObjectPool(toSerialize)

  function recurse (object: any) {
    const copy: any = Array.isArray(object) ? [] : {}

    if (object.constructor !== Object && object.constructor !== Array) {
      copy['#class'] = constructorToId.get(object.constructor)
    }

    const ignoreSet = constructorToIgnoreSet.get(object.constructor)

    for (const key in object) {
      if (ignoreSet?.has(key)) {
        continue
      }
      const value = object[key]
      if (typeof value === 'object' && value !== null) {
        const id = objectPool.get(value)
        copy[key] = id !== undefined ? `→${id}` : recurse(value)
      } else {
        copy[key] = value
      }
    }

    return copy
  }

  const serialized = {
    pool: mapIter(objectPool.keys(), (object) => recurse(object)),
    object: recurse(toSerialize),
  }

  return JSON.stringify(serialized)
}

export function deserialize (json: string) {
  const { object, pool } = JSON.parse(json)

  const dereferencedPool = pool.map((object: any) => {
    return instantiateFromTemplate(object)
  })

  function recurse (object: any, copy: any = instantiateFromTemplate(object)) {
    for (const key in object) {
      if (key === '#class') {
        continue
      }
      const value = object[key]
      if (typeof value === 'string' && value[0] === '→') {
        copy[key] = dereferencedPool[parseFloat(value.slice(1))]
      } else if (typeof value === 'object' && value !== null) {
        copy[key] = recurse(value)
      } else {
        copy[key] = value
      }
    }

    // TODO: call for parents too
    constructorToAfterDeserialize.get(copy.constructor)?.(copy)

    return copy
  }

  function instantiateFromTemplate (object: any) {
    if (object['#class']) {
      const Constructor = idToConstructor.get(object['#class'])!
      return new Constructor()
    } else if (Array.isArray(object)) {
      return []
    } else {
      return {}
    }
  }

  for (let i = 0; i < pool.length; i++) {
    recurse(pool[i], dereferencedPool[i])
  }

  const deserialized = recurse(object)

  return deserialized
}

function findParentWithValue<T> (
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

function makeObjectPool (object: any) {
  const objectSet = new Set<any>()
  const sharedObjects = new Set<any>()

  function findSharedObjects (object: any) {
    const ignoreSet = constructorToIgnoreSet.get(object.constructor)

    for (const key in object) {
      if (ignoreSet?.has(key)) {
        continue
      }
      const value = object[key]
      if (typeof value !== 'object' || value === null) {
        continue
      }
      if (!objectSet.has(value)) {
        objectSet.add(value)
        findSharedObjects(value)
      } else {
        sharedObjects.add(value)
      }
    }
  }

  findSharedObjects(object)

  const objectPool = new Map<any, number>()
  let id = 0
  for (const object of sharedObjects) {
    objectPool.set(object, id++)
  }

  return objectPool
}

const sharey = { iAmShared: true }
const sharey2: any = {}
sharey2['iAmShared'] = true

const circ1: any = { name: 'circular1' }
const circ2: any = { name: 'circular2' }

circ1.r = circ2
circ2.r = circ1

class AClass {
  sharey = sharey
  sharey2 = sharey2
  aClassIgnore = 'bye'
  d?: AClass
  a!: string

  manOhMan () {
    console.log('man')
  }
}

class BClass extends AClass {
  circular = circ1
  bClassIgnore = 'nothing'
  f = { thing: 'here and there' }
  array = ['does this', sharey]

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

serializable(AClass, {
  ignore: ['aClassIgnore'],
  afterDeserialize: (object) => {
    console.log('base doing', object)
  },
})

serializable(BClass, {
  ignore: ['bClassIgnore'],
  // beforeSerialize: (object) => {
  //   console.log('doing it', object)
  // },
  // afterDeserialize: (object) => {
  //   console.log('done it', object)
  // }

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

