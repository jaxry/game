import { addStyle } from './makeStyle.ts'

addStyle(`*`, {
  boxSizing: `border-box`,
})

addStyle(`body`, {
  margin: `0`,
})

addStyle(`button`, {
  font: `inherit`,
  color: `inherit`,
  border: `none`,
  background: `none`,
})

addStyle(`ul`, {
  margin: `0`,
  padding: `0`,
  listStyle: `none`,
})
