import { spawn } from './behavior/spawn'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeWood } from './objects/wood'
import { typeZone } from './objects/zone'
import generateTriGrid from './map/generateTriGrid'
import { randomElement } from './util'

export function initGame (game: Game) {
  game.energyPool = 128

  game.world = spawn(typeZone)

  const zones = generateTriGrid(40)
  const zone = randomElement(zones)

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