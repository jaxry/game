import { spawn } from './behavior/spawn'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeWood } from './objects/wood'
import { typeZone } from './objects/zone'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeTree } from './objects/tree'

export function initGame (game: Game) {
  game.energyPool = 100

  game.world = spawn(typeZone)

  const zones = createMap(3)
  const zone = randomElement(zones)

  game.player = spawn(typeYou, zone)

  spawn(typeWood, game.player)
  spawn(typeWood, game.player)

  // for (let i = 0; i < 5; i++) {
  //   spawn(typeVillager, zone)
  // }

  // for (let i = 0; i < 3; i++) {
  //   spawn(typeWood, zone)
  // }

  // for (let i = 0; i < 40; i++) {
  //   spawn(typeWood, randomElement(zones))
  // }

  for (let i = 0; i < 3; i++) {
    spawn(typeTree, zone)
  }

  const chest = spawn(typeChest, zone)
}

const typeYou = makeType({
  name: `Boof Nasty`,
  isContainer: true,
})
