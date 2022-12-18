import type GameObject from './GameObject'

type Phrase = string | GameObject

interface LogEntry {
  message: Phrase[]
}

export default class GameLog {
  entries: LogEntry[] = []
  isFinished = true
  important = false

  get size () {
    return this.entries.length
  }

  start () {
    this.entries.length = 0
    this.isFinished = false
    this.important = false
  }

  finish () {
    this.isFinished = true
  }

  write (...message: Phrase[]) {
    this.entries.push({
      message,
    })
  }

  writeImportant (...message: Phrase[]) {
    this.write(...message)
    this.important = true
  }
}
