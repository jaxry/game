import { spawn } from './behavior/spawn'
import Game from './Game'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeWorld } from './objects/world'
import { typeWood } from './objects/wood'
import { typePlayer } from './objects/player'
import { setPlayer } from './behavior/player'
import { typeVillager } from './objects/villager'

export function initGame (game: Game) {
  game.energyPool = 600

  game.world = spawn(typeWorld)

  const zones = createMap(5)
  const zone = randomElement(zones)

  for (let i = 0; i < 3; i++) {
    spawn(typeVillager, zone)
  }

  for (let i = 0; i < 30; i++) {
    spawn(typeWood, randomElement(zones))
  }

  const chest = spawn(typeChest, zone)
  spawn(typeWood, chest)

  const player = spawn(typePlayer, zone)
  setPlayer(player)
  spawn(typeWood, player)
  spawn(typeWood, player)
}

