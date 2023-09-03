import { makeType } from '../GameObjectType'
import { s4Permutations } from '../symmetricGroup'

export const typeWood = makeType({
  name: 'wood',
  element: s4Permutations[1]
})