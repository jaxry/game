import initCanvasKit, { CanvasKit } from 'canvaskit-wasm'
import CanvasKitWasm from "canvaskit-wasm/bin/canvaskit.wasm?url";

export let canvasKit: CanvasKit;

export const canvasKitReady = initCanvasKit({
  locateFile: () => CanvasKitWasm,
}).then((readyCanvasKit) => {
  canvasKit = readyCanvasKit;
})