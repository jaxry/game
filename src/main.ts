import { initGame } from './initGame'
import './ui/components/Game'
import App from './ui/components/App'

initGame()

const app = new App(document.getElementById('app')!)

export default app