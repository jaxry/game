import GameTime from './GameTime'
import type GameObject from './GameObject'
import type Effect from './effects/Effect'
import Observable from './Observable'
import { serializable } from './serialize'
import PriorityQueue from './PriorityQueue'
import { children } from './behavior/container'

export default class Game {
  time = new GameTime()
  event = {
    tick: new Observable(),
    playerChange: new Observable<GameObject>(),
    worldModified: new Observable(),
  }
  player!: GameObject
  world!: GameObject
  timedEffects = new PriorityQueue<Effect>()
  energyPool = 0
}

serializable(Game, {
  transform: {
    event: serializable.ignore,
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

  for (const child of children(object)) {
    child.container = object
    rehydrateObject(child)
  }
}

export let game: Game

export function setGameInstance (instance: Game) {
  game = instance
  // @ts-ignore
  window.game = game
}
