import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import { game } from './Game'
import { makeType } from './GameObject'
import GameTime from './GameTime'
import { generateDelaunayZones } from './generateDelaunayZones'
import { typeMonster } from './objects/monster'

export function initGame() {
  game.energyPool = 2 * GameTime.hour

  const world = spawn(typeWorld)

  const zones = generateDelaunayZones(7)
  for (const zone of zones) {
    putInsideContainer(world, zone)
  }

  const zone = world.contains[0]

  // spawn(typeMonster, world.contains.at(-1))

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 10; i++) {
    spawn(typeApple, zone)
  }


  const chest = spawn(typeChest, zone)
  spawn(typeApple, chest)
  spawn(typeApple, chest)

  game.log.write(`Welcome to your new life, soyboy`)
}

const typeWorld = makeType({
  name: `world`,
  isContainer: true,
})

const typeYou = makeType({
  name: `Soyboy Jack`,
  properNoun: true,
  isContainer: true,
  health: 25,
})

const typeChest = makeType({
  name: `chest`,
  description: `A wooden chest filled with loot`,
  isContainer: true,
})

const typeApple = makeType({
  name: 'apple',
  description: `A crunchy apple. The most generic of items`,
})