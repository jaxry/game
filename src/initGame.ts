import { spawn } from './behavior/spawn'
import Game from './Game'
import { randomElement } from './util'
import createMap from './map/createMap'
import { typeChest } from './objects/chest'
import { typeWorld } from './objects/world'
import { typePlayer } from './objects/player'
import { setPlayer } from './behavior/player'
import { typeVillager } from './objects/villager'
import { typeTree } from './objects/tree'
import { advanceTime } from './behavior/gameLoop'
import GameTime from './GameTime'

export function initGame (game: Game) {
  game.world = spawn(typeWorld)

  const zones = createMap(5)
  const zone = randomElement(zones)

  advanceTime(2 * GameTime.minute)

  for (let i = 0; i < 3; i++) {
    spawn(typeVillager, zone)
  }

  const chest = spawn(typeChest, zone)
  spawn(typeTree, chest)

  const player = spawn(typePlayer, zone)
  setPlayer(player)
  spawn(typeTree, player)
  spawn(typeTree, player)
}

