import { LogEntry, NamedEntity } from '../gameLog.ts'
import { createSpan, createTextNode } from '../util/createElement.ts'
import Entity from '../Entity.ts'
import { entityForegroundColor } from './theme.ts'
import { entityElement } from './entityElement.ts'
import Component from '../util/Component.ts'

export function formatLogEntry (
    component: Component, parent: HTMLElement, entry: LogEntry) {
  for (const piece of entry) {
    if (piece instanceof Entity) {
      formatEntity(component, parent, piece, piece.name ?? '')
    } else if (piece instanceof NamedEntity) {
      formatEntity(component, parent, piece.entity, piece.name)
    } else {
      createTextNode(parent, piece)
    }
  }
}

function formatEntity (
    component: Component, parent: HTMLElement, entity: Entity, name: string) {
  const element = createSpan(parent, undefined, ` ${name} `)
  element.style.color = entityForegroundColor(entity).toString()
  entityElement(component, element, entity)
}