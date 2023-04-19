import GameObject from '../GameObject'

export function speak (object: GameObject, message: string) {
  object.container?.emit('speak', { object, message })
}