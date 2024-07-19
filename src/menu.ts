import * as Pong from "./pong";
import * as BulletHell from "./bullet-hell";
import { pause, paused, setPause } from "./pause";

const games = [
  {
    name: "pong",
    logic: Pong,
  },
  {
    name: "dodge",
    logic: BulletHell,
  },
] as const;
let game = null as null | (typeof games)[number];
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
      if (gamepad.buttons[13].pressed) {
        index++;
      }
      if (gamepad.buttons[12].pressed) {
        index--;
      }
      if (
        // "A" button pressed
        gamepad.buttons[0].pressed ||
        // "start" button pressed
        gamepad.buttons[9].pressed
      ) {
        game = games[intuitiveModulus(index, games.length)];
      }
    });
  }
  animatedIndex += (index - animatedIndex) * 0.015 * dt;

  // DRAW
  /////////////
  if (!game) {
    // render menu
    const fontSize = 30;
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    const gameNames = games.map((game) => game.name);
    const canvasRect = canvas.getBoundingClientRect();
    const numberToDrawAboveAndBelow = 4;
    const spacing = 20;
    const totalToDraw = numberToDrawAboveAndBelow * 2 + 1;
    const centerOffset = Math.floor(totalToDraw / 2);
    ctx.filter = `blur(${Math.abs(index - animatedIndex) * 2}px)`;
    {
      const animatedIndexFloored = Math.floor(animatedIndex);
      for (let i = 0; i < totalToDraw; i++) {
        const gameIndex = intuitiveModulus(
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
      }
      ctx.globalAlpha = 1;
    }
    return;
  }

  if (navigator.getGamepads().some((gamepad) => gamepad?.buttons[9].pressed)) {
    pause();
  }

  if (!paused) {
    game.logic.update(dt);
  }
  if (game !== null) {
    game.logic.draw(canvas, ctx);
  }
  const drawRect = canvas.getBoundingClientRect();
  if (paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, drawRect.width, drawRect.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED", drawRect.width / 2, drawRect.height / 2);
  }
}

function intuitiveModulus(n: number, m: number) {
  // it handles negatives the way you would expect
  return ((n % m) + m) % m;
}

export function returnToMenu() {
  game = null;
}

// for dev
// document.addEventListener("keydown", (e) => {
//   if (e.key === "ArrowDown") index++;
//   if (e.key === "ArrowUp") index--;
//   if (e.key === "Enter") {
//     if (game) {
//       setPause(!paused);
//     } else {
//       game = games[intuitiveModulus(index, games.length)];
//     }
//   }
// });
