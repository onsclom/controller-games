import { updateAndDraw as pongUpdateAndDraw } from "./pong";
import { updateAndDraw as bulletHellUpdateAndDraw } from "./bullet-hell";

const games = {
  pong: pongUpdateAndDraw,
  dodge: bulletHellUpdateAndDraw,
};
const gameNames = Object.keys(games);

let game = null as null | keyof typeof games;
let index = 0;
let animatedIndex = 0;

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  /////////////
  if (!game) {
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad) => {
      if (!gamepad) return;
      // if dpad down, index++
      if (gamepad.buttons[13].pressed) {
        index++;
      }
      if (gamepad.buttons[12].pressed) {
        index--;
      }
    });
  }

  animatedIndex += (index - animatedIndex) * 0.015 * dt;

  // DRAW
  /////////////
  if (!game) {
    // render menu

    const fontSize = 30;
    // draw the current game in the middle
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    const gameNames = Object.keys(games);
    const canvasRect = canvas.getBoundingClientRect();
    const numberToDrawAboveAndBelow = 4;
    const spacing = 20;

    const totalToDraw = numberToDrawAboveAndBelow * 2 + 1;
    const centerOffset = Math.floor(totalToDraw / 2);
    ctx.filter = `blur(${Math.abs(index - animatedIndex) * 2}px)`;
    {
      const animatedIndexFloored = Math.floor(animatedIndex);
      for (let i = 0; i < totalToDraw; i++) {
        const gameIndex = modulusThatHandlesNegatives(
          animatedIndexFloored + i - centerOffset,
          gameNames.length,
        );
        const animatedDecimal = animatedIndex - animatedIndexFloored;
        const gameName = gameNames[gameIndex];
        const y =
          canvasRect.height / 2 +
          (i - centerOffset - animatedDecimal) * (fontSize + spacing);

        const distFromCenter = Math.min(
          1,
          Math.abs(i - centerOffset - animatedDecimal) *
            (1 / numberToDrawAboveAndBelow),
        );
        ctx.globalAlpha = 1 - distFromCenter ** 0.5;
        ctx.fillText(gameName, canvasRect.width / 2, y);
        ctx.globalAlpha = 1;
      }
    }
    return;
  }

  games[game](canvas, ctx, dt);
}

function modulusThatHandlesNegatives(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function returnToMenu() {
  game = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") index++;
  if (e.key === "ArrowUp") index--;
  if (e.key === "Enter") {
    game = gameNames[modulusThatHandlesNegatives(index, gameNames.length)];
  }
});
