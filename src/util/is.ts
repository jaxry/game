export function isPrimitive (x: any) {
  return x === null || typeof x !== 'object' && typeof x !== 'function'
}

export function isNumber (x: any) {
  return typeof x === 'number'
}

export function isString (x: any) {
  return typeof x === 'string'
}

export function isFunction (x: any): x is Function {
  return typeof x === 'function'
}

export function isArray (x: any): x is any[] {
  return Array.isArray(x)
}

export function isObject (x: any): x is Object {
  return typeof x === 'object'
}