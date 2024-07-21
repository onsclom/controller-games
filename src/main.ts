// vite bundling bug? (try switching this import order!)
import { saveGamepadState } from "./controller";
import { updateAndDraw } from "./game-menu";

const FIXED_FPS = null; // null for requestAnimationFrame, or a number for fixed FPS
const SHOW_FRAME_TIME = true;
const BUDGET = 1000 / 120;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d")!;
let interval = 0;
let raf = 0;

if (FIXED_FPS) {
  interval = setInterval(gameStep, 1000 / FIXED_FPS);
} else {
  requestAnimationFrame(function render() {
    gameStep();
    raf = requestAnimationFrame(render);
  });
}

let lastTime: number | null = null;
let maxTime = 0;
let droppedFrames = 0;
function gameStep() {
  {
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width * window.devicePixelRatio;
    canvas.height = canvasRect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  lastTime = lastTime || performance.now();
  const newTime = performance.now();
  const dt = newTime - lastTime;
  lastTime = newTime;
  updateAndDraw(canvas, ctx, dt);
  saveGamepadState();

  if (SHOW_FRAME_TIME) {
    const endTime = performance.now();
    const total = endTime - newTime;
    if (endTime > BUDGET) {
      droppedFrames++;
    }
    if (endTime > maxTime) {
      maxTime = endTime;
    }

    // ctx.textBaseline = "top";
    // ctx.fillStyle = "red";
    // ctx.font = "20px sans-serif";
    // ctx.fillText(
    //   `max frame time: ${maxTime.toFixed(1)}ms, (${Math.round((100 * maxTime) / BUDGET)}%)`,
    //   10,
    //   10,
    // );
    // ctx.fillText(`dropped frames: ${droppedFrames}`, 10, 40);
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cancelAnimationFrame(raf);
    clearInterval(interval);
    canvas.remove();
  });
}
