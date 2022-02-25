import { getContext, setContext } from 'svelte'

export default function useContext<T>() {
  const key = Symbol()

  return {
    set(t: T) {
      setContext<T>(key, t)
    },
    get(): T {
      return getContext(key)
    },
  }
}