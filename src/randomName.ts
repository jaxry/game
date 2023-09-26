import { randomElement } from './util/util.ts'

const syllables = [
  'a', 'i', 'u', 'e', 'o',
  'ka', 'ki', 'ku', 'ke', 'ko',
  'sa', 'shi', 'su', 'se', 'so',
  'ta', 'chi', 'tsu', 'te', 'to',
  'na', 'ni', 'nu', 'ne', 'no',
  'ha', 'hi', 'fu', 'he', 'ho',
  'ma', 'mi', 'mu', 'me', 'mo',
  'ya', 'yu', 'yo',
  'ra', 'ri', 'ru', 're', 'ro',
  'wa', 'wu',
  'ga', 'gi', 'gu', 'ge', 'go',
  'za', 'zu', 'ze', 'zo',
  'da', 'de', 'do',
  'ba', 'bi', 'bu', 'be', 'bo',
  'pa', 'pi', 'pu', 'pe', 'po',
]

const ySyllables = [
  'kya', 'kyu', 'kyo',
  'sha', 'shu', 'sho',
  'cha', 'chu', 'cho',
  'nya', 'nyu', 'nyo',
  'hya', 'hyu', 'hyo',
  'mya', 'myu', 'myo',
  'rya', 'ryu', 'ryo',
  'gya', 'gyu', 'gyo',
  'bya', 'byu', 'byo',
  'pya', 'pyu', 'pyo',
]

export function randomName (numSyllables: number) {
  let out = ''

  for (let i = 0; i < numSyllables; i++) {
    out += randomElement(Math.random() < 0.1 ? ySyllables : syllables)
  }

  return out
}

export function capitalizeFirst (string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}