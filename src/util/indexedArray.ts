// ---------------
// Indexed Array
// ---------------
export interface IndexedArrayElement {
  _index: number
}

// Like Set.add
export function addIndexedElement<T extends IndexedArrayElement> (
  array: T[], element: T) {
  element._index = array.length
  array.push(element)
  return element
}

// Like Set.delete
export function deleteIndexedElement<T extends IndexedArrayElement> (
  array: T[], element: T) {
  const i = element._index
  if (i === array.length - 1) {
    array.pop()
  } else {
    array[i] = array.pop()!
    array[i]._index = i
    element._index = -1
  }
  return element
}