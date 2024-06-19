import { deserialize, serialize } from './util/serialize.ts'
import { game, setGameInstance } from './main.ts'

export function loadGame () {
  loadFromFile().then((json) => {
    if (!json) {
      return
    }
    const game = deserialize(json)
    setGameInstance(game)
  })
}

export function saveGame () {
  const save = serialize(game)
  const request = indexedDB.open('game')
  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite').objectStore('saves').put(save, 'save')
  }
}

export function deleteSave () {
  const request = indexedDB.open('game')

  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite').objectStore('saves').delete('save')
  }
}

function loadFromFile () {
  return new Promise<string>((resolve, reject) => {
    const request = indexedDB.open('game')

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('saves')
    }

    request.onsuccess = () => {
      const db = request.result
      const val = db.transaction('saves').objectStore('saves').get('save')

      val.onsuccess = () => resolve(val.result)
    }
  })
}