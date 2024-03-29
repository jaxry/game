import { serializable } from './serialize'

export default class GameTime {
  static second = 1
  static millisecond = 0.001 * GameTime.second
  static minute = 60 * GameTime.second
  static hour = 60 * GameTime.minute
  static day = 24 * GameTime.hour
  current = 0

  static displaySeconds (time: number) {
    return (time * GameTime.second).toFixed(1)
  }

  getSecondOfMinute (): number {
    return Math.floor(this.current / GameTime.second) % 60
  }

  getMinuteOfHour (): number {
    return Math.floor(this.current / GameTime.minute) % 60
  }

  getHourOfDay (): number {
    return Math.floor(this.current / GameTime.hour) % 24
  }

  getTimeOfDay () {
    return this.getHourOfDay().toString().padStart(2, `0`) + `:`
        + this.getMinuteOfHour().toString().padStart(2, `0`) + `:`
        + this.getSecondOfMinute().toString().padStart(2, `0`)
  }
}
serializable(GameTime)