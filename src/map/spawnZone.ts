import { spawn } from '../behavior/spawn'
import { typeZone } from '../objects/zone'
import Point from '../Point'
import { getWorld } from '../behavior/general'

export default function spawnZone () {
  const zone = spawn(typeZone, getWorld())
  zone.position = new Point()
  return zone
}