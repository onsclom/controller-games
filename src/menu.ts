import { updateAndDraw as pongUpdateAndDraw } from "./pong";
import { updateAndDraw as bulletHellUpdateAndDraw } from "./bullet-hell";

const games = {
  pong: pongUpdateAndDraw,
  "bullet hell": bulletHellUpdateAndDraw,
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
    const gameNames = Object.keys(games);
    const curGame =
      gameNames[modulusThatHandlesNegatives(index, gameNames.length)];
    const canvasRect = canvas.getBoundingClientRect();
    const animatedDifference = animatedIndex - index;
    const numberToDrawAboveAndBelow = 3;
    const spacing = 10;
    ctx.fillText(
      curGame,
      canvasRect.width / 2,
      canvasRect.height / 2 - animatedDifference * (fontSize + spacing),
    );

    ctx.globalAlpha = 0.2;

    for (let i = 1; i <= numberToDrawAboveAndBelow; i++) {
      const gameAbove =
        gameNames[modulusThatHandlesNegatives(index - i, gameNames.length)];
      if (gameAbove) {
        ctx.fillText(
          gameAbove,
          canvasRect.width / 2,
          canvasRect.height / 2 -
            (i + animatedDifference) * (fontSize + spacing),
        );
      }
      const gameBelow =
        gameNames[modulusThatHandlesNegatives(index + i, gameNames.length)];
      if (gameBelow) {
        ctx.fillText(
          gameBelow,
          canvasRect.width / 2,
          canvasRect.height / 2 +
            (i - animatedDifference) * (fontSize + spacing),
        );
      }
    }
    ctx.globalAlpha = 1;

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
    game = gameNames.at(index)!;
  }
});
