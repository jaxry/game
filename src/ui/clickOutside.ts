export default function clickOutside(
    inner: HTMLElement, callback: () => void, outer = document.body) {
  let clicked = false

  function insideClick() {
    clicked = true
  }

  function outsideClick() {
    if (!clicked) {
      callback()
    }
    clicked = false
  }

  setTimeout(() => {
    inner.addEventListener('click', insideClick)
    outer.addEventListener('click', outsideClick)
  })

  return () => {
    inner.removeEventListener('click', insideClick)
    outer!.removeEventListener('click', outsideClick)
  }
}