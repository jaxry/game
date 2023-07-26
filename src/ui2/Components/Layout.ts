import Box from './Box'
import { Constructor } from '../../types'

export default class Layout extends Box {
  declare childComponents: Set<Box>

  addToLayout<T extends Constructor<Box>> (
      constructor: T, ...args: ConstructorParameters<T>) {
    this.newComponent(constructor, ...args)

    let currentHeight = 0
    for (const child of this.childComponents!) {
      child.x = this.x
      child.y = this.y + currentHeight
      currentHeight += child.height
    }
  }
}