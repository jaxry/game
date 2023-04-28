import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import GameTime from './GameTime'
import { generateRandomGraph } from './map/generateRandomGraph'
import ForceDirectedSim from './map/ForceDirectedSim'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeVillager } from './objects/villager'
import { typeWood } from './objects/wood'
import { randomElement } from './util'

export function initGame (game: Game) {
  game.energyPool = 2 * GameTime.hour

  game.world = spawn(typeWorld)

  const zones = generateRandomGraph(30)
  for (const zone of zones) {
    putInsideContainer(game.world, zone)
  }

  const zone = zones[0]

  new ForceDirectedSim().simulateFully(zone)

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 3; i++) {
    spawn(typeWood, game.player)
  }

  for (let i = 0; i < 30; i++) {
    spawn(typeWood, randomElement(zones))
  }

  for (let i = 0; i < 10; i++) {
    spawn(typeVillager, randomElement(zones))
  }

  const chest = spawn(typeChest, zone)
  spawn(typeWood, chest)
  spawn(typeWood, chest)
}

const typeWorld = makeType({
  name: `world`,
  isContainer: true,
})

const typeYou = makeType({
  name: `Boof Nasty`,
  isContainer: true,
})

const typeChest = makeType({
  name: `chest`,
  description: `A wooden chest filled with loot`,
  isContainer: true,
})