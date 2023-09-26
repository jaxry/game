import GameTime from './GameTime'
import type Entity from './Entity.ts'
import { initEntityAfterLoad } from './Entity.ts'
import type Effect from './effects/Effect'
import Observable from './util/Observable.ts'
import { serializable } from './util/serialize.ts'
import PriorityQueue from './util/PriorityQueue.ts'
import { toPrecision } from './util/util.ts'

export default class Game {
  time = new GameTime()
  tick = new Observable()
  timedEffects = new PriorityQueue<Effect>()

  world: Entity

  //ui state
  viewedZone: Entity
  viewedZoneChanged = new Observable<Entity>()
}

serializable(Game, {
  transform: {
    tick: serializable.ignore,
    viewedZoneChanged: serializable.ignore,
  },
  afterDeserialize: (game: Game) => {
    initEntityAfterLoad(game.world)
  },
})

serializable(PriorityQueue, {
  transform: {
    priority: (priority) => priority.map((p) => toPrecision(p, 3)),
  },
})