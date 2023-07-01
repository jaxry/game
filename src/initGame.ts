import { spawn } from './behavior/spawn'
import Game from './Game'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeWorld } from './objects/world'
import { typeWood } from './objects/wood'
import { typeTree } from './objects/tree'
import { typePlayer } from './objects/player'

export function initGame (game: Game) {
  game.energyPool = 512

  game.world = spawn(typeWorld)

  const zones = createMap(3)
  const zone = randomElement(zones)

  game.player = spawn(typePlayer, zone)

  spawn(typeWood, game.player)
  spawn(typeWood, game.player)

  // for (let i = 0; i < 5; i++) {
  //   spawn(typeVillager, zone)
  // }

  // for (let i = 0; i < 3; i++) {
  //   spawn(typeWood, zone)
  // }
  //
  // for (let i = 0; i < 40; i++) {
  //   spawn(typeWood, randomElement(zones))
  // }
  //
  for (let i = 0; i < 2; i++) {
    spawn(typeTree, zone)
  }

  const chest = spawn(typeChest, zone)
}

