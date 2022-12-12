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

  function recurse (value: any, makeSharedReference = true): any {
    if (typeof value !== 'object' || value === null) {
      return value
    }

    const object = value

    if (makeSharedReference && objectPool.has(object)) {
      return `→${objectPool.get(object)}`
    }

    if (object instanceof Set) {
      return {
        '#set': mapIter(object, value => recurse(value)),
      }
    } else if (object instanceof Map) {
      return {
        '#map': mapIter(object,
            ([key, value]) => [recurse(key), recurse(value)]),
      }
    } else if (Array.isArray(object)) {
      return object.map(value => recurse(value))
    }

    const copy: any = {}

    if (object.constructor !== Object) {
      copy['#class'] = constructorToId.get(object.constructor)
    }

    const ignoreSet = constructorToIgnoreSet.get(object.constructor)

    for (const key in object) {
      if (ignoreSet?.has(key)) {
        continue
      }
      copy[key] = recurse(object[key])
    }

    return copy
  }

  const serialized = {
    pool: mapIter(objectPool.keys(), (object) => recurse(object, false)),
    object: recurse(toSerialize, true),
  }

  return JSON.stringify(serialized)
}

export function deserialize (json: string) {
  const { object, pool } = JSON.parse(json)

  const dereferencedPool = pool.map((object: any) => {
    return instantiateFromTemplate(object)
  })

  function recurse (value: any, copy: any = instantiateFromTemplate(value)) {
    if (typeof value === 'string' && value[0] === '→') {
      return dereferencedPool[parseFloat(value.slice(1))]
    } else if (typeof value !== 'object' || value === null) {
      return value
    }

    if (copy instanceof Set) {
      for (const item of value['#set']) {
        copy.add(recurse(item))
      }
    } else if (copy instanceof Map) {
      for (const [key, item] of value['#map']) {
        copy.set(recurse(key), recurse(item))
      }
    } else {
      for (const key in value) {
        if (key[0] === '#') {
          continue
        }
        copy[key] = recurse(value[key])
      }
    }

    constructorToAfterDeserialize.get(copy.constructor)?.(copy)

    return copy
  }

  function instantiateFromTemplate (object: any) {
    if (object['#class']) {
      const Constructor = idToConstructor.get(object['#class'])!
      return new Constructor()
    } else if (Array.isArray(object)) {
      return []
    } else if (object['#set']) {
      return new Set()
    } else if (object['#map']) {
      return new Map()
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

  function findSharedObjects (value: any) {
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
        findSharedObjects(value)
      }
    } else if (object instanceof Map) {
      for (const [key, value] of object) {
        findSharedObjects(key)
        findSharedObjects(value)
      }
    } else {
      const ignoreSet = constructorToIgnoreSet.get(object.constructor)

      for (const key in object) {
        if (ignoreSet?.has(key)) {
          continue
        }
        findSharedObjects(object[key])
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

class BClass extends AClass {
  circular = circ1
  setThing2 = setThing
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
  // afterDeserialize: (object) => {
  //   console.log('base doing', object)
  // },
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

