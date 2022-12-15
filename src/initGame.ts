import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import { game } from './Game'
import GameTime from './GameTime'
import { typeMonster } from './objects/monster'
import { generateRandomGraph } from './map/generateRandomGraph'
import { startForceDirectedSimulation } from './map/forceDirectedSim'
import { makeType } from './GameObjectType'

export function initGame () {
  game.energyPool = 2 * GameTime.hour

  const world = spawn(typeWorld)

  const zones = generateRandomGraph(20)
  for (const zone of zones) {
    putInsideContainer(world, zone)
  }

  const zone = zones[0]

  startForceDirectedSimulation(zone)

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 3; i++) {
    spawn(typeApple, game.player)
  }

  for (let i = 0; i < 25; i++) {
    spawn(Math.random() > 0.5 ? typeMonster : typeApple,
        zones.at(Math.random() * zones.length))
  }

  const chest = spawn(typeChest, zone)
  spawn(typeApple, chest)
  spawn(typeApple, chest)
}

const typeWorld = makeType({
  name: `world`,
  isContainer: true,
})

const typeYou = makeType({
  name: `Soyboy Jack`,
  icon: `😭`,
  properNoun: true,
  isContainer: true,
  health: Infinity,
})

const typeChest = makeType({
  name: `chest`,
  icon: `📦`,
  description: `A wooden chest filled with loot`,
  isContainer: true,
})

const typeApple = makeType({
  name: `apple`,
  icon: '🍎',
  health: 2,
  description: `A crunchy apple. The most generic of items`,
})