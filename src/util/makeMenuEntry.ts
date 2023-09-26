import Component from './Component.ts'
import Timer from './Timer.ts'
import { makeWindow, setWindowPosition } from './makeWindow.ts'
import { makeOrGet } from './util.ts'

const removeSubmenuTime = 300
const showSubmenuTime = 200

class MenuProps {
  submenu?: Component
  submenuElement?: HTMLElement
}

const menuPropsMap = new WeakMap<HTMLElement, MenuProps>()
const activeStyles = new WeakMap<HTMLElement, string>()

let hoveredElement: HTMLElement | undefined

const removeSubmenuTimer = new Timer()
const showSubmenuTimer = new Timer()

export function makeMenuEntry (
    parent: any, element: HTMLElement, activeStyle = '',
    submenuCreator?: () => Component) {

  const props = makeOrGet(menuPropsMap, parent, () => new MenuProps())
  activeStyles.set(element, activeStyle)

  let dx = 0
  let dy = 0
  element.addEventListener('pointermove', (e) => {
    // take rolling average to improve precision
    dx = 0.5 * e.movementX + 0.5 * dx
    dy = 0.5 * e.movementY + 0.5 * dy
  })

  element.addEventListener('pointerleave', (e) => {
    hoveredElement = undefined

    showSubmenuTimer.stop()

    if (element !== props.submenuElement) {
      element.classList.remove(activeStyle)
      return
    }

    const rect = props.submenu!.element.getBoundingClientRect()
    if (isMouseMovingToRect(e.clientX, e.clientY, dx, dy, rect)) {
      removeSubmenuTimer.start(() => removeSubmenu(props), removeSubmenuTime)
    } else {
      removeSubmenu(props)
    }
  })

  element.addEventListener('pointerenter', () => {
    // setTimeout makes pointerenter run after pointerleave
    setTimeout(() => {
      hoveredElement = element

      if (element === props.submenuElement) {
        removeSubmenuTimer.stop()
        return
      }

      if (!props.submenuElement) {
        element.classList.add(activeStyle)
      }

      if (removeSubmenuTimer.isFinished) {
        removeSubmenu(props)
      }

      if (submenuCreator) {
        showSubmenuTimer.start(() => {
          createSubmenu(props, element, submenuCreator)
        }, removeSubmenuTimer.remainingTime + showSubmenuTime)
      }
    })
  })
}

function createSubmenu (
    props: MenuProps, element: HTMLElement, creator: () => Component) {
  const { x, y, width } = element.getBoundingClientRect()
  const menu = creator()
  makeWindow(menu)

  let menuX = x + width
  const menuWidth = menu.element.offsetWidth
  if (menuX + menuWidth > window.innerWidth) {
    menuX = x - menuWidth
  }

  setWindowPosition(menu, menuX, y)

  menu.element.addEventListener('pointerenter', () => {
    removeSubmenuTimer.stop()
  })

  props.submenu = menu
  props.submenuElement = element
}

function removeSubmenu (props: MenuProps) {
  if (!props.submenu) return

  props.submenu.remove()

  props.submenuElement!.classList.remove(
      activeStyles.get(props.submenuElement!)!)
  hoveredElement?.classList.add(activeStyles.get(hoveredElement!)!)

  props.submenu = undefined
  props.submenuElement = undefined
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