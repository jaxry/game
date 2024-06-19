import Component, { ComponentChild } from '../util/Component.ts'
import Frame, { frame } from '../util/Frame.ts'
import { makeStyle } from '../util/makeStyle.ts'

export function hover (content: ComponentChild) {
  return (component: Component) => {
    let popup: Frame | undefined
    component
      .on('pointerenter', e => {
        popup = frame({
          pointerEvents: false,
        }).add(content).addTo(component).toMouse(e)
      })
      .on('pointermove', e => {
        popup!.toMouse(e)
      })
      .on('pointerleave', () => {
        popup!.remove()
        popup = undefined
      })
  }
}

export function contextMenu (menu: ComponentChild) {
  return (c: Component) => {
    c.on('click', (e) => {
      frame({
        exitOnOutsideClick: true,
      })
        .style(contextMenuStyle)
        .add(menu)
        .addTo(c)
        .toMouse(e)
    })
  }
}

const contextMenuStyle = makeStyle({
  cursor: `pointer`,
})

export function rememberScroll (key: any) {
  return (component: Component) => {
    component.on('scroll', () => {
      scrollMap.set(key, component.element.scrollTop)
    })
    component.onMount(() => {
      component.element.scrollTop = scrollMap.get(key) ?? 0
    })
  }
}

const scrollMap = new WeakMap<any, number>