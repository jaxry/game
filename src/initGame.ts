import { spawn } from './behavior/spawn'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeWood } from './objects/wood'
import { typeZone } from './objects/zone'
import { generateRandomGraph } from './map/generateRandomGraph'

export function initGame (game: Game) {
  game.energyPool = 128

  game.world = spawn(typeZone)

  // const zone = growMapTri()
  // const zone = wattsStrogatzGraph()
  const zones = generateRandomGraph(30)
  const zone = zones[0]
  //
  // const z1 = spawnZone()
  // const z2 = spawnZone()
  // const z3 = spawnZone()
  // const z4 = spawnZone()
  // const z5 = spawnZone()
  // const z6 = spawnZone()
  // connectZones(z1, z2)
  // connectZones(z1, z3)
  // connectZones(z1, z4)
  // connectZones(z3, z4)
  // connectZones(z3, z5)
  // connectZones(z4, z6)
  // connectZones(z5, z6)
  // const zone = z1

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 3; i++) {
    spawn(typeWood, game.player)
  }

  // for (let i = 0; i < 30; i++) {
  //   spawn(typeWood, randomElement(zones))
  // }
  //
  // for (let i = 0; i < 10; i++) {
  //   spawn(typeVillager, randomElement(zones))
  // }
  //
  // const chest = spawn(typeChest, zone)
  // spawn(typeWood, chest)
  // spawn(typeWood, chest)
}

const typeYou = makeType({
  name: `Boof Nasty`,
  isContainer: true,
})

const typeChest = makeType({
  name: `chest`,
  description: `A wooden chest filled with loot`,
  isContainer: true,
})