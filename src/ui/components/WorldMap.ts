import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { getCell } from '../../logic/grid.ts'
import { createDiv } from '../../util/createElement.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import MapCell from './MapCell.ts'
import { makeOrGet } from '../../util/util.ts'

export default class WorldMap extends Component {
  distanceFromCenter = 3
  cellMap = new Map<Entity, HTMLElement>()
  center = { x: 0, y: 0 }

  onCellClick?: (cell: Entity | null, x: number, y: number) => void

  override onInit () {
    this.style(componentStyle)
    this.element.addEventListener('click', (e) => {
      if (e.currentTarget !== e.target) return
      const bbox = this.element.getBoundingClientRect()
      const mx = (e.clientX - bbox.left) / bbox.width
      const my = (e.clientY - bbox.top) / bbox.height
      const rows = this.distanceFromCenter * 2 + 1
      const dx = Math.floor(mx * rows) - this.distanceFromCenter
      const dy = Math.floor(my * rows) - this.distanceFromCenter
      this.onCellClick?.(null, this.center.x + dx, this.center.y - dy)
    })
  }

  render (land: Entity, center: { x: number, y: number }) {
    this.center = center
    const d = this.distanceFromCenter
    const rows = d * 2 + 1
    const width = `${100 / rows}%`

    const contains = new Set<Entity>()

    for (let dy = -d; dy <= d; dy++) {
      for (let dx = -d; dx <= d; dx++) {
        const zone = getCell(land, this.center.x + dx, this.center.y - dy)
        if (!zone) continue
        const cell = makeOrGet(this.cellMap, zone, () => this.makeCell(zone))
        cell.style.width = width
        cell.style.height = width
        cell.style.translate = `${(dx + d) * 100}% ${(dy + d) * 100}%`
        contains.add(zone)
      }
    }

    for (const [zone, cell] of this.cellMap) {
      if (!contains.has(zone)) {
        cell.remove()
        this.cellMap.delete(zone)
      }
    }
  }

  private makeCell (zone: Entity) {
    const cell = createDiv(this.element, cellStyle)
    this.newComponent(MapCell, zone).appendTo(cell)
    cell.addEventListener('click',
        () => this.onCellClick?.(zone, zone.gridPosition!.x,
            zone.gridPosition!.y))
    return cell
  }
}

const componentStyle = makeStyle({
  aspectRatio: `1`,
  position: `relative`,
})

const cellStyle = makeStyle({
  position: `absolute`,
  padding: `1px`,
})

