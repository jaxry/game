import { deserialize, serialize } from './util/serialize.ts'
import Game from './Game'
import { compress, decompress, strFromU8, strToU8 } from 'fflate'

export function loadGame () {
  return loadFromFile().then(saveFile => new Promise<any>((resolve) => {
    decompress(saveFile, {}, (err, decompressed) => {
      const json = strFromU8(decompressed)
      const game = deserialize(json)
      resolve(game)
    })
  }))
}

export function saveGame (game: Game) {
  const save = serialize(game)
  compress(strToU8(save), {}, (err, compressed) => saveToFile(compressed))
  // const buffer = strToU8(save)
  // compress(buffer, {}, (err, compressed) => {
  //   console.log(buffer.length, compressed.length)
  //   saveToFile(compressed)
  // })
}

function saveToFile (save: Uint8Array) {
  const request = indexedDB.open('game')

  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite').objectStore('saves').put(save, 'save')
  }
}

function loadFromFile () {
  return new Promise<Uint8Array>((resolve, reject) => {
    const request = indexedDB.open('game')

    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('saves')
    }

    request.onsuccess = () => {
      const db = request.result
      const val = db.transaction('saves').objectStore('saves').get('save')

      val.onsuccess = () => {
        val.result !== undefined ?
            resolve(val.result) :
            reject()
      }
    }
  })
}

export function deleteSave () {
  const request = indexedDB.open('game')

  request.onsuccess = () => {
    const db = request.result
    db.transaction('saves', 'readwrite').objectStore('saves').delete('save')
  }
}