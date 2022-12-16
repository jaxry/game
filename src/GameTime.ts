import { serializable } from './serialize'

export default class GameTime {
  static second = 1
  static minute = 60 * GameTime.second
  static hour = 60 * GameTime.minute
  static day = 24 * GameTime.hour
  static week = 7 * GameTime.day
  static month = 30 * GameTime.week
  static year = 365 * GameTime.month

  current = 0

  getSecondOfMinute (): number {
    return this.current % 60
  }

  getMinuteOfHour (): number {
    return Math.floor(this.current / GameTime.minute) % 60
  }

  getHourOfDay (): number {
    return Math.floor(this.current / GameTime.hour) % 24
  }

  getDayOfWeek (): number {
    return Math.floor(this.current / GameTime.day) % 7
  }

  getTimeOfDay () {
    return this.getHourOfDay().toString().padStart(2, `0`) + `:`
        + this.getMinuteOfHour().toString().padStart(2, `0`) + `:`
        + this.getSecondOfMinute().toString().padStart(2, `0`)
  }
}
serializable(GameTime)