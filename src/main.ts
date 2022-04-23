import { initGame } from './initGame'
import './ui/components/Game'
import AppComponent from './ui/components/Game'

initGame()

const app = new AppComponent(document.getElementById('app')!)

export default app