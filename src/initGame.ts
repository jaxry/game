import Game from './Game'
import Entity from './Entity.ts'
import { putInside } from './logic/container.ts'
import { capitalizeFirst, randomName } from './randomName.ts'
import { changedViewedZoned, makeZone } from './logic/zone.ts'
import { randomInt } from './util/util.ts'

export function initGame (game: Game) {
  game.world = new Entity()

  const land = new Entity()
  putInside(land, game.world)

  const home = makeZone(land, 0, 0)
  home.name = 'Home'
  changedViewedZoned(home)

  makeZone(land, 1, 0)

  // makeZone(land, 1, 0)
  const other = makeZone(land, 1, 1)
  other.name = 'Other'

  const chest = new Entity()
  chest.name = 'Chest'
  putInside(chest, home)

  for (let i = 0; i < 5; i++) {
    makeMaterializer(chest)
  }

  for (let i = 0; i < 1; i++) {
    const guy = new Entity()
    guy.name = capitalizeFirst(randomName(randomInt(2, 4)))
    putInside(guy, home)
    makeMaterializer(guy)
    // new Warper(chest).activate(guy)
  }

  // advanceTime(300)
}

export function makeMaterializer (entity: Entity) {
  const materializer = new Entity()
  materializer.name = `materializer ${randomName(1)}`
  materializer.materializer = true
  putInside(materializer, entity)
  return materializer
}