import initCanvasKit, { CanvasKit, FontMgr, Typeface } from 'canvaskit-wasm'
import CanvasKitWasm from "canvaskit-wasm/bin/canvaskit.wasm?url"
import fontUrl from './RobotoMono.ttf'

export let canvasKit: CanvasKit
export let fontMgr: FontMgr
export let typeface: Typeface

export const canvasKitReady = Promise.all([
  initCanvasKit({ locateFile: () => CanvasKitWasm }),
  fetch(fontUrl).then((response) => response.arrayBuffer()),
]).then(([readyCanvasKit, font]) => {
  canvasKit = readyCanvasKit
  fontMgr = canvasKit.FontMgr.FromData(font)!
  typeface = canvasKit.Typeface.MakeFreeTypeFaceFromData(font)!
})