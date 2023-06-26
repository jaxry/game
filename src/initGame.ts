import { spawn } from './behavior/spawn'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeWood } from './objects/wood'
import { typeZone } from './objects/zone'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeVillager } from './objects/villager'

export function initGame (game: Game) {
  game.energyPool = 128

  game.world = spawn(typeZone)

  const zones = createMap(5)
  const zone = randomElement(zones)

  game.player = spawn(typeYou, zone)

  spawn(typeWood, game.player)
  spawn(typeWood, game.player)

  for (let i = 0; i < 5; i++) {
    spawn(typeVillager, zone)
  }

  // for (let i = 0; i < 3; i++) {
  //   spawn(typeWood, zone)
  // }

  for (let i = 0; i < 40; i++) {
    spawn(typeWood, randomElement(zones))
  }

  const chest = spawn(typeChest, zone)
}

const typeYou = makeType({
  name: `Boof Nasty`,
  isContainer: true,
})
