import { spawn } from '../behavior/spawn'
import { typeZone } from '../objects/zone'
import { game } from '../Game'
import Point from '../Point'

export default function spawnZone () {
  const zone = spawn(typeZone, game.world)
  zone.position = new Point()
  return zone
}