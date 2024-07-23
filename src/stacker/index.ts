import { Buttons, justPressed } from "./controller";
import { returnToMenu } from "./game-menu";
import { playSound } from "./sound";

const rainbowColors = ["#fcc", "#cfc", "#ccf"];

let highScore = 0;
const gameSize = {
  width: 200,
  height: 400,
};

let state = createState();
function createState() {
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
      if (state.currentWidth === 0) {
        returnToMenu();
        return;
      }
      const previousBlock = state.stack[state.stack.length - 1];
      const end = Math.min(
        state.xOffset + state.currentWidth,
        previousBlock.offset + previousBlock.width,
      );
      const start = Math.max(state.xOffset, previousBlock.offset);
      const newWidth = end - start;
      if (newWidth > 0) {
        state.currentWidth = newWidth;
        state.xOffset = start;
        state.stack.push({
          width: state.currentWidth,
          offset: state.xOffset,
        });
        state.xOffset = 0;
        playSound({
          frequency: 220 * 2 ** (state.stack.length / 12),
          type: "sine",
          duration: 0.1,
        });
      } else {
        // you lose
        state.currentWidth = 0;
        playSound({
          frequency: 220,
          type: "sawtooth",
          duration: 0.1,
        });
      }
    }
  });
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  // draw rect at center of screen
  const drawArea = canvas.getBoundingClientRect();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // lets scale and letter box the game
  const gameAspectRatio = gameSize.width / gameSize.height;
  const screenAspectRatio = drawArea.width / drawArea.height;
  const drawWidth =
    gameAspectRatio > screenAspectRatio
      ? drawArea.width
      : drawArea.height * gameAspectRatio;
  const drawHeight =
    gameAspectRatio > screenAspectRatio
      ? drawArea.width / gameAspectRatio
      : drawArea.height;

  const drawRect = {
    x: (drawArea.width - drawWidth) / 2,
    y: (drawArea.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };

  ctx.translate(drawRect.x, drawRect.y);
  ctx.scale(drawRect.width / gameSize.width, drawRect.height / gameSize.height);

  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, gameSize.width, gameSize.height);
  const blockHeight = 10;
  ctx.fillStyle = rainbowColors[state.stack.length % rainbowColors.length];
  ctx.fillRect(
    state.xOffset,
    gameSize.height / 2 - blockHeight / 2,
    state.currentWidth,
    blockHeight,
  );

  ctx.save();
  state.stack.toReversed().forEach((block, i) => {
    ctx.translate(0, blockHeight);
    const reverseIndex = state.stack.length - i - 1;
    ctx.fillStyle = rainbowColors[reverseIndex % rainbowColors.length];
    ctx.fillRect(
      block.offset,
      gameSize.height / 2 - blockHeight / 2,
      block.width,
      blockHeight,
    );
  });
  ctx.restore();

  highScore = Math.max(highScore, state.stack.length - 1);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + (state.stack.length - 1), gameSize.width / 2, 20);
}
