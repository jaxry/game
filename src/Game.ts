import GameTime from './GameTime'
import type { GameObject } from './GameObject'
import type { Effect } from './behavior/Effect'
import Observer from './Observer'
import { serializable } from './serialize'

class Game {
  time = new GameTime()
  event = {
    playerTickEnd: new Observer(),
    mapUpdated: new Observer(),
    playerChange: new Observer<GameObject>(),
  }
  player!: GameObject
  world!: GameObject
  effectsWithTick = [new Set(), new Set()] as Set<Effect>[]
  energyPool = 0
}

serializable(Game, {
  ignore: ['event', 'effectsWithTick'],
  afterDeserialize: (game: Game) => {
    rehydrateObject(game.world)
  },
})

function rehydrateObject (object: GameObject) {
  if (object.effects) {
    for (const effect of object.effects) {
      effect.object = object
      effect.activate()
    }
  }

  if (object.contains) {
    for (const child of object.contains) {
      child.container = object
      rehydrateObject(child)
    }
  }
}

export const game = new Game