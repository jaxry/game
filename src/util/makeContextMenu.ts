import Component from './Component.ts'
import Timer from './Timer.ts'
import { frame } from './Frame.ts'

const removeSubmenuTime = 300
const showSubmenuTime = 200

class MenuProps {
  submenu?: Component
  submenuEntry?: Component
}

const activeStyles = new WeakMap<Component, string>()

let hovered: Component | undefined

const removeSubmenuTimer = new Timer()
const showSubmenuTimer = new Timer()

export function makeContextMenu () {
  const props = new MenuProps()
  //component.do function
  return (activeStyle = '', submenu?: () => Component) =>
    (component: Component) => menuEntry(component, props, activeStyle, submenu)
}

function menuEntry (
  component: Component, props: MenuProps, activeStyle: string,
  submenu?: () => Component) {
  activeStyles.set(component, activeStyle)

  let dx = 0
  let dy = 0
  component.on('pointermove', (e) => {
    // take rolling average to improve precision
    dx = 0.5 * e.movementX + 0.5 * dx
    dy = 0.5 * e.movementY + 0.5 * dy
  })

  component.on('pointerenter', () => {
    // setTimeout makes pointerenter run after pointerleave
    setTimeout(() => {
      hovered = component

      // if returning to the entry with submenu, cancel close timer
      if (component === props.submenuEntry) {
        removeSubmenuTimer.stop()
        return
      }

      // if submenu not open, change hovered component immediately
      if (!props.submenuEntry) {
        component.style(activeStyle)
      }

      // if mouse enters entry from outside the menu, remove the current submenu
      if (removeSubmenuTimer.isFinished) {
        removeSubmenu(props)
      }

      // start timer to show submenu for this entry
      if (submenu) {
        showSubmenuTimer.start(() => {
          createSubmenu(props, component, submenu)
        }, removeSubmenuTimer.remainingTime + showSubmenuTime)
      }
    })
  })

  component.on('pointerleave', (e) => {
    hovered = undefined

    // stop preparing to show the entry's submenu
    showSubmenuTimer.stop()

    // for simple entries, remove hover style immediately
    if (component !== props.submenuEntry) {
      component.removeStyle(activeStyle)
      return
    }

    // remove submenu immediately if mouse not moving towards submenu
    // otherwise start a removal timer
    const rect = props.submenu!.element.getBoundingClientRect()
    if (isMouseMovingToRect(e.clientX, e.clientY, dx, dy, rect)) {
      removeSubmenuTimer.start(() => removeSubmenu(props), removeSubmenuTime)
    } else {
      removeSubmenu(props)
    }
  })
}

function createSubmenu (
  props: MenuProps, entry: Component, submenu: () => Component) {
  const { x, y, width } = entry.rect()
  const menu = frame().add(submenu).addTo(entry)

  let menuX = x + width
  if (menuX + menu.width > window.innerWidth) {
    menuX = x - menu.width
  }
  menu.position(menuX, y)

  // stop removal timer of this menu if mouse enters
  menu.on('pointerenter', () => {
    removeSubmenuTimer.stop()
  })

  props.submenu = menu
  props.submenuEntry = entry
}

function removeSubmenu (props: MenuProps) {
  if (!props.submenu) return

  props.submenu.remove()

  // show currently hovered entry when submenu closes
  props.submenuEntry!.removeStyle(activeStyles.get(props.submenuEntry!)!)
  hovered?.style(activeStyles.get(hovered!)!)

  props.submenu = undefined
  props.submenuEntry = undefined
}

function isMouseMovingToRect (
  x: number, y: number, dx: number, dy: number, rect: DOMRect) {
  const closestX = rect.left > x ? rect.left : rect.right
  const topDir = normalize(closestX - x, rect.top - y)
  const bottomDir = normalize(closestX - x, rect.bottom - y)
  const mouseDir = normalize(dx, dy)
  const maxAngle = dot(topDir, bottomDir)
  const a1 = dot(mouseDir, topDir)
  const a2 = dot(mouseDir, bottomDir)
  return Math.min(a1, a2) > maxAngle
}

function normalize (x: number, y: number) {
  const len = Math.sqrt(x * x + y * y)
  return {
    x: x / len,
    y: y / len,
  }
}

function dot (a: { x: number; y: number }, b: { x: number; y: number }) {
  return a.x * b.x + a.y * b.y
}