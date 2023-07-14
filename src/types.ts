export type Constructor<T = any> = { new (...args: any[]): T }

export type KeysMatching<T, V> =
    { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];