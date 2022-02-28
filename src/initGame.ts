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

  game.player = spawn(typeYou, zone)
  // spawn(typeMonster, world.contains.at(-1))

  for (let i = 0; i < 5; i++) {
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
  name: `locker`,
  description: `A school locker to store your class supplies in. Easy to stuff weak people in.`,
  isContainer: true,
})

const typeApple = makeType({
  name: 'apple',
  description: `A crunchy apple. The most generic of items`,
})
