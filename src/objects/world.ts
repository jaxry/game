import { makeType } from '../GameObjectType'
import SpawnTrees from '../effects/spawnTrees'

export const typeWorld = makeType({
  name: `world`,
  isContainer: true,
  energy: 2 ** 10,
  effects: [SpawnTrees],
})