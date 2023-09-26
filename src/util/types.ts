export type Constructor<T = any> = { new (...args: any[]): T }

export type ConstructorExtends<T, U extends T = any> = {
  new (...args: any[]): U
}