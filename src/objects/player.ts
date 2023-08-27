import { makeType } from '../GameObjectType'
import Metabolism from '../effects/metabolism'

export const typePlayer = makeType({
  name: `Boof Nasty`,
  isContainer: true,
  energy: 10,
  effects: [Metabolism],
})
