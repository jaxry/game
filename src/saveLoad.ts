import { deserialize, serialize } from './serialize'
import { initGame } from './initGame'
import Game, { game, setGameInstance } from './Game'

export function loadGame () {
  return loadSaveFile().then((saveFile) => {
    setGameInstance(deserialize(saveFile))
  }, () => {
    const newGame = new Game()
    setGameInstance(newGame)
    initGame(newGame)
  })
}

export function saveGameToFile () {
  const save = serialize(game)

  const request = indexedDB.open('game')

  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite')
        .objectStore('saves').put(save, 'save')
  }
}

function loadSaveFile () {
  return new Promise<string>((resolve, reject) => {
    const request = indexedDB.open('game')

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('saves')
    }

    request.onsuccess = () => {
      const db = request.result
      const val = db.transaction('saves').objectStore('saves').get('save')
      val.onsuccess = () => {
        val.result !== undefined ? resolve(val.result) : reject(val.result)
      }
    }
  })
}

export function deleteSaveFile () {
  const request = indexedDB.open('game')

  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite').objectStore('saves').delete('save')
  }
}