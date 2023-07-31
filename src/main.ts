import App from './ui/components/App'

// let app: App
//
// export function restartGame () {
//   loadGame().then(() => {
//     app?.remove()
//     app = new App()
//     document.body.append(app.element)
//   })
// }
//
// restartGame()

const app = new App()
app.appendTo(document.body)
