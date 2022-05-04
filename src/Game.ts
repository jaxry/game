import GameTime from './GameTime'
import type { GameObject } from './GameObject'
import type { Effect } from './behavior/Effect'
import CustomEvent from './CustomEvent'
import GameObjectLog from './GameObjectLog'

export const game = {
  time: new GameTime(),
  objectLog: new GameObjectLog(),
  event: {
    playerTickStart: new CustomEvent(),
    playerTickEnd: new CustomEvent(),
  },
  player: {} as GameObject,
  effectsWithTick: [new Set(), new Set()] as Set<Effect>[],
  energyPool: 0,
}

export type Game = typeof game