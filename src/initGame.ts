import { putInsideContainer } from './behavior/container'
import { spawn } from './behavior/spawn'
import { game } from './Game'
import { makeType } from './GameObject'
import GameTime from './GameTime'
import { generateDelaunayZones } from './generateDelaunayZones'
import { typeMonster } from './objects/monster'
import { PlayerUIHook } from './ui/PlayerUIHook'

export function initGame() {
  game.energyPool = 2 * GameTime.hour

  const world = spawn(typeWorld)

  const zones = generateDelaunayZones(3)
  for (const zone of zones) {
    putInsideContainer(world, zone)
  }

  const zone = world.contains[0]

  game.player = spawn(typeYou, zone)

  for (let i = 0; i < 0; i++) {
    spawn(typeApple, zone)
  }

  // for (let i = 0; i < 5; i++) {
  //   spawn(typeMonster, world.contains.at(Math.random() * world.contains.length))
  // }
  spawn(typeMonster, world.contains[0])


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
  properNoun: true,
  isContainer: true,
  health: 25,
  effects: [PlayerUIHook]
})

const typeChest = makeType({
  name: `chest`,
  description: `A wooden chest filled with loot`,
  isContainer: true,
})

const typeApple = makeType({
  name: 'apple',
  health: 2,
  description: `A crunchy apple. The most generic of items`,
})