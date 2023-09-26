import EntityInfo from './components/EntityInfo.ts'
import { makeWindow, setWindowPosition } from '../util/makeWindow.ts'
import Component from '../util/Component.ts'
import Entity from '../Entity.ts'
import { isAncestor } from '../logic/container.ts'
import { game } from '../main.ts'
import { changedViewedZoned } from '../logic/zone.ts'

const popups = new WeakMap<Entity, Component>()

export function entityElement (
    component: Component, element: HTMLElement, entity: Entity) {

  makeHover(component, element, entity)

  element.addEventListener('click', (e) => {
    if (isAncestor(game.viewedZone, entity)) {
      makePopup(component, entity, e)
    } else {
      changedViewedZoned(getAncestorWithPosition(entity))
    }
  })
}

function makeHover (
    component: Component, element: HTMLElement, entity: Entity) {
  element.addEventListener('pointerenter', (e) => {
    const info = component.newComponent(EntityInfo, entity)
    makeWindow(info, {
      pointerEvents: false,
    })

    const move = (e: PointerEvent) => {
      setWindowPosition(info!, e.clientX, e.clientY)
    }

    move(e)

    element.addEventListener('pointermove', move)

    element.addEventListener('pointerleave', () => {
      info.remove()
      element.removeEventListener('pointermove', move)
    })
  })
}

function makePopup (component: Component, entity: Entity, e: MouseEvent) {
  let popup = popups.get(entity)

  if (!popup) {
    popup = component.newComponent(EntityInfo, entity, true)
    makeWindow(popup, {
      exitButton: true,
      draggable: true,
    })
    popup.onRemove(() => {
      popups.delete(entity)
    })
    popups.set(entity, popup)
  }

  setWindowPosition(popup, e.clientX, e.clientY)
}

function getAncestorWithPosition (entity: Entity) {
  while (entity && !entity.gridPosition) {
    entity = entity.parent
  }
  return entity
}

