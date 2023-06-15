import GameObject from '../GameObject'

export function speak (object: GameObject, message: string) {
  object.emit('speak', message)
}