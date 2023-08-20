import { spawn } from './behavior/spawn'
import Game from './Game'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeWorld } from './objects/world'
import { typeWood } from './objects/wood'
import { typeTree } from './objects/tree'
import { typePlayer } from './objects/player'
import { typeVillager } from './objects/villager'
import { setPlayer } from './behavior/player'

export function initGame (game: Game) {
  game.energyPool = 600

  game.world = spawn(typeWorld)

  const zones = createMap(5)
  const zone = randomElement(zones)

  for (let i = 0; i < 3; i++) {
    spawn(typeVillager, zone)
  }

  for (let i = 0; i < 20; i++) {
    spawn(typeWood, randomElement(zones))
  }

  for (let i = 0; i < 4; i++) {
    spawn(typeTree, zone)
  }

  const chest = spawn(typeChest, zone)
  spawn(typeWood, chest)

  const player = spawn(typePlayer, zone)
  setPlayer(player)
  spawn(typeWood, player)
  spawn(typeWood, player)
}

