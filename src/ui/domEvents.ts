import Observable from '../util/Observable.ts'

export const visibilityChange = new Observable()
document.addEventListener('visibilitychange', () => visibilityChange.emit())

