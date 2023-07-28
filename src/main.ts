import './ui2/style.css'
import Base from './ui2/Components/Base'
import Stage from './ui2/Stage'
import { canvasKitReady } from './ui2/canvasKit.ts'

canvasKitReady.then(() => {
  new Stage(document.body, new Base())
})

// let app: App
// export function restartGame () {
//   loadGame().then(() => {
//     app?.remove()
//     app = new App()
//     document.body.append(app.element)
//   })
// }
// restartGame()

// class Rect {
//   x = Math.random()
//   y = Math.random()
//   w = Math.random()
//   h = Math.random()
//
//   contains (x: number, y: number) {
//     return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
//   }
// }
// function test() {
//   const rects: any[] = []
//   for (let i = 0; i < 1000; i++) {
//     const rect = new Rect()
//     rects.push(rect)
//   }
//
//   let hits = 0
//   function perf () {
//     // for (let i = 0; i < 100; i++) {
//       const x = 2 * Math.random()
//       const y = 2 * Math.random()
//       for (const rect of rects) {
//         hits += rect.contains(x, y) ? 1 : 0
//       }
//     // }
//     requestAnimationFrame(perf)
//   }
//   perf()
// }
