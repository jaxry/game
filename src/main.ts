import { initGame } from './initGame'
import './ui/components/App'
import AppComponent from './ui/components/App'

initGame()

const app = new AppComponent(document.getElementById('app')!)

export default app