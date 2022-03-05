import GameLog from './GameLog'
import GameTime from './GameTime'
import type { GameObject } from './GameObject'
import type { Effect } from './behavior/Effect'
import GameEvent from './GameEvent'
import GameObjectLog from './GameObjectLog'

export const game = {
  time: new GameTime(),
  log: new GameLog(),
  objectLog: new GameObjectLog(),
  event: {
    playerTick: new GameEvent<undefined>(),
  },
  player: {} as GameObject,
  effectsWithTick: [new Set(), new Set()] as Set<Effect>[],
  energyPool: 0,
}

export type Game = typeof game