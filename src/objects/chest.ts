import { makeType } from '../GameObjectType'

export const typeChest = makeType({
  name: `chest`,
  description: `A box to put stuff in`,
  isContainer: true,
})