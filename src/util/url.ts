import Observable from './Observable.ts'

export const urlChange = new Observable()

export function pushURL (path: string) {
  if (location.pathname === path) return
  history.pushState({}, '', path)
  urlChange.emit()
}

export function replaceURL (path: string) {
  if (location.pathname === path) return
  history.replaceState({}, '', path)
  urlChange.emit()
}

window.addEventListener('popstate', () => urlChange.emit())