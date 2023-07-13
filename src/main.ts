import './ui2/style.css'
import Base from './ui2/Components/Base'
import Stage from './ui2/Stage'

new Stage(document.body, new Base())

// let app: App
// export function restartGame () {
//   loadGame().then(() => {
//     app?.remove()
//     app = new App()
//     document.body.append(app.element)
//   })
// }
// restartGame()