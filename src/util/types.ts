export type Constructor<T = any> = { new (...args: any[]): T }

export type ConstructorExtends<T, U extends T = any> = {
  new (...args: any[]): U
}

export type StringLike = {
  toString (): string
}

export type Falsy = void | undefined | null | 0 | '' | false

export type WeakMapKey = object | symbol
