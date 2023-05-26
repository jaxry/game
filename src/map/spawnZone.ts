import { spawn } from '../behavior/spawn'
import { typeZone } from '../objects/zone'
import { game } from '../Game'

export default function spawnZone () {
  return spawn(typeZone, game.world)
}