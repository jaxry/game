import './ui/components/GameUI'
import App from './ui/components/App'
import { loadGame } from './Game'

loadGame()

let app = new App()
document.body.append(app.element)