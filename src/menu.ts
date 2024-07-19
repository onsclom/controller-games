import { updateAndDraw as pongUpdateAndDraw } from "./pong";
import { updateAndDraw as bulletHellUpdateAndDraw } from "./bullet-hell";
import { updateAndDraw as setUpdateAndDraw } from "./set";

const games = [
  ["pong", pongUpdateAndDraw],
  ["bullet hell", bulletHellUpdateAndDraw],
  ["set", setUpdateAndDraw],
] as const;

// let game = null as null | (typeof games)[number];
let game = games[2] as null | (typeof games)[number];
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

  animatedIndex += (index - animatedIndex) * 0.01 * dt;

  // DRAW
  /////////////
  if (!game) {
    // render menu

    const fontSize = 30;
    // draw the current game in the middle
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    const gameNames = games.map(([name]) => name);
    const canvasRect = canvas.getBoundingClientRect();
    const numberToDrawAboveAndBelow = 4;
    const spacing = 10;

    const totalToDraw = numberToDrawAboveAndBelow * 2 + 1;
    const center = Math.floor(totalToDraw / 2);
    for (let i = 0; i < totalToDraw; i++) {
      const gameIndex = modulusThatHandlesNegatives(
        index + i - center,
        gameNames.length,
      );
      const animatedDifference = animatedIndex - index;
      const gameName = gameNames[gameIndex];
      const y =
        canvasRect.height / 2 +
        (i - center - animatedDifference) * (fontSize + spacing);

      const distFromCenter = Math.min(
        1,
        Math.abs(i - center - animatedDifference) *
          (1 / numberToDrawAboveAndBelow),
      );
      ctx.globalAlpha = 1 - distFromCenter ** 0.5;
      ctx.fillText(gameName, canvasRect.width / 2, y);
      ctx.globalAlpha = 1;
    }
    return;
  }

  const [_gameName, updateAndDraw] = game;
  updateAndDraw(canvas, ctx, dt);
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
    game = games[modulusThatHandlesNegatives(index, games.length)];
  }
});
