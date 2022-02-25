import { initGame } from './initGame'

import App from './ui/App.svelte'

initGame()

const app = new App({
  target: document.getElementById('app'),
})

export default app
