import GameTime from './GameTime'
import type GameObject from './GameObject'
import type Effect from './behavior/Effect'
import Observable from './Observable'
import { serializable } from './serialize'

export default class Game {
  time = new GameTime()
  event = {
    tickEnd: new Observable(),
    mapPositionUpdate: new Observable(),
    mapUpdate: new Observable(),
    playerChange: new Observable<GameObject>(),
  }
  player!: GameObject
  world!: GameObject
  effectsWithTick = [new Set(), new Set()] as Set<Effect>[]
  energyPool = 0
}

serializable(Game, {
  transform: {
    event: serializable.ignore,
    effectsWithTick: serializable.ignore,
  },
  afterDeserialize: (game: Game) => {
    rehydrateObject(game.world)
  },
})

function rehydrateObject (object: GameObject) {
  if (object.effects) {
    for (const effect of object.effects) {
      effect.object = object
      effect.passiveActivation()
    }
  }

  if (object.contains) {
    for (const child of object.contains) {
      child.container = object
      rehydrateObject(child)
    }
  }
}

export let game: Game

export function setGameInstance (instance: Game) {
  game = instance
}
