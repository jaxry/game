export default function clickOutside (
    inner: Element, callback: () => void, outer = document.body) {
  let clicked = false

  function insideClick () {
    clicked = true
  }

  function outsideClick () {
    if (!clicked) {
      callback()
    }
    clicked = false
  }

  // add listeners after current event loop, so that they aren't triggered
  // with a currently active click
  setTimeout(() => {
    inner.addEventListener('click', insideClick)
    outer.addEventListener('click', outsideClick)
  })

  return () => {
    inner.removeEventListener('click', insideClick)
    outer!.removeEventListener('click', outsideClick)
  }
}