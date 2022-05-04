import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import { game } from './Game'
import { makeType } from './GameObject'
import GameTime from './GameTime'
import { typeMonster } from './objects/monster'
import { generateRandomGraph } from './map/generateRandomGraph'

export function initGame() {
  game.energyPool = 2 * GameTime.hour

  const world = spawn(typeWorld)

  const zones = generateRandomGraph(20)
  for (const zone of zones) {
    putInsideContainer(world, zone)
  }

  const zone = world.contains[0]

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 0; i++) {
    spawn(typeApple, zone)
  }

  for (let i = 0; i < 25; i++) {
    // spawn(typeMonster, world.contains.at(Math.random() * world.contains.length))
    // spawn(Math.random() > 0.5 ? typeMonster : typeApple, world.contains[0])
    spawn(Math.random() > 0.5 ? typeMonster : typeApple,
        world.contains.at(Math.random() * world.contains.length))

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