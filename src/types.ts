export type Constructor<T = {}> = { new (...args: any[]): T }

export type KeysOfType<T, Value> = {
  [Key in keyof T]: T[Key] extends Value ? Key : never
}[keyof T]