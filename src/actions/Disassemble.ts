import TargetAction from './TargetAction'
import { disassemble } from '../behavior/craft'

export default class Disassemble extends TargetAction {
  override get name () {
    return ['Disassemble', this.target]
  }

  override condition () {
    return super.condition() && this.target.type.composedOf?.length > 0
  }

  override do () {
    disassemble(this.target)
  }
}