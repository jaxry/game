import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import GameTime from './GameTime'
import { generateRandomGraph } from './map/generateRandomGraph'
import { startForceDirectedSimulation } from './map/forceDirectedSim'
import { makeType } from './GameObjectType'
import Game from './Game'
import { typeMonster } from './objects/monster'

export function initGame (game: Game) {
  game.energyPool = 2 * GameTime.hour

  game.world = spawn(typeWorld)

  const zones = generateRandomGraph(30)
  for (const zone of zones) {
    putInsideContainer(game.world, zone)
  }

  const zone = zones[0]

  startForceDirectedSimulation(zone)

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 3; i++) {
    spawn(typeApple, game.player)
  }

  for (let i = 0; i < 15; i++) {
    spawn(Math.random() > 0.2 ? typeMonster : typeApple,
        zones.at(Math.random() * zones.length))
  }

  // for (let i = 0; i < 5; i++) {
  //   spawn(typeApple, zone)
  // }

  const chest = spawn(typeChest, zone)
  spawn(typeApple, chest)
  spawn(typeApple, chest)
}

const typeWorld = makeType({
  name: `world`,
  isContainer: true,
})

const typeYou = makeType({
  name: `Boof Nasty`,
  icon: `😭`,
  properNoun: true,
  isContainer: true,
  health: 99999,
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