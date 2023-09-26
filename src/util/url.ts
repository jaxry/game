import Observable from './Observable.ts'

export const urlChange = new Observable()
window.addEventListener('popstate', () => urlChange.emit())

// pressing the back button will take you back to the URL before this call
export function pushURL (path: string) {
  if (location.pathname === path) return
  history.pushState({}, '', path)
  urlChange.emit()
}

// pressing the back button won't take you back to the previous URL
export function replaceURL (path: string) {
  if (location.pathname === path) return
  history.replaceState({}, '', path)
  urlChange.emit()
}

