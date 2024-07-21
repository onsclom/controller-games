import { Buttons, justPressed } from "./controller";

let state = createState();

let highScore = 0;
const gameSize = {
  width: 200,
  height: 400,
};

function createState() {
  const gameSize = {
    width: 200,
    height: 400,
  };
  const startingCurrentWidth = 50;
  return {
    currentWidth: startingCurrentWidth,
    xOffset: 0,
    dx: 1,

    stack: [
      { width: 50, offset: gameSize.width / 2 - startingCurrentWidth / 2 },
    ] as {
      width: number;
      offset: number;
    }[],
  };
}

export function reset() {
  state = createState();
}

export function update(dt: number) {
  state.xOffset += (state.dx * dt) / 5;
  if (state.xOffset < 0) {
    state.xOffset = 0;
    state.dx = 1;
  }
  if (state.xOffset + state.currentWidth > 200) {
    state.xOffset = 200 - state.currentWidth;
    state.dx = -1;
  }

  const gamepads = navigator.getGamepads();
  gamepads.forEach((gamepad) => {
    if (!gamepad) return;
    if (justPressed(Buttons.A, gamepad)) {
      const previousBlock = state.stack[state.stack.length - 1];

      const end = Math.min(
        state.xOffset + state.currentWidth,
        previousBlock.offset + previousBlock.width,
      );
      const start = Math.max(state.xOffset, previousBlock.offset);
      const newWidth = end - start;
      if (newWidth >= 0) {
        state.currentWidth = newWidth;
        state.xOffset = start;
        state.stack.push({
          width: state.currentWidth,
          offset: state.xOffset,
        });
        state.xOffset = 0;
      } else {
        console.log("you lost!");
        reset();
      }
    }
  });
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  // draw rect at center of screen
  const drawArea = canvas.getBoundingClientRect();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#333";
  ctx.fillRect(
    drawArea.width / 2 - gameSize.width / 2,
    drawArea.height / 2 - gameSize.height / 2,
    gameSize.width,
    gameSize.height,
  );

  ctx.translate(
    drawArea.width / 2 - gameSize.width / 2,
    drawArea.height / 2 - gameSize.height / 2,
  );
  const blockHeight = 10;
  ctx.fillStyle = "white";
  ctx.fillRect(
    state.xOffset,
    gameSize.height / 2 - blockHeight / 2,
    state.currentWidth,
    blockHeight,
  );

  ctx.save();
  state.stack.toReversed().forEach((block) => {
    ctx.translate(0, blockHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(
      block.offset,
      gameSize.height / 2 - blockHeight / 2,
      block.width,
      blockHeight,
    );
  });
  ctx.restore();

  highScore = Math.max(highScore, state.stack.length - 1);

  // draw score at top center
  ctx.fillStyle = "white";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("High Score: " + highScore, gameSize.width / 2, 10);
  ctx.font = "20px Arial";
  ctx.fillText(
    "Score: " + (state.stack.length - 1),
    gameSize.width / 2,
    20 + 20,
  );
}
