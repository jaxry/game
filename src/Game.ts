import GameTime from './GameTime'
import type { GameObject } from './GameObject'
import type { Effect } from './behavior/Effect'
import Observer from './Observer'

export const game = {
  time: new GameTime(),
  event: {
    playerTickEnd: new Observer(),
    mapUpdated: new Observer(),
    playerChange: new Observer<GameObject>(),
  },
  player: {} as GameObject,
  effectsWithTick: [new Set(), new Set()] as Set<Effect>[],
  energyPool: 0,
}

export type Game = typeof game