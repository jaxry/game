import { serializable } from './util/serialize.ts'

export default class GameTime {
  static second = 1
  static minute = 60 * GameTime.second
  static hour = 60 * GameTime.minute
  static day = 24 * GameTime.hour
  current = 0

  getSecondOfMinute () {
    return (Math.floor(this.current / GameTime.second) % 60).toString()
        .padStart(2, `0`)
  }

  getMinuteOfHour () {
    return (Math.floor(this.current / GameTime.minute) % 60).toString()
        .padStart(2, `0`) + `:` + this.getSecondOfMinute()
  }

  getHourOfDay () {
    return (Math.floor(this.current / GameTime.hour) % 24).toString()
        .padStart(2, `0`) + `:` + this.getMinuteOfHour()
  }
}
serializable(GameTime)