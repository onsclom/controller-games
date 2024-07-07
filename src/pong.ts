import { gameState } from "./state";

const paddleWidth = 10;
const paddleHeight = 70;

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
  state: typeof gameState,
) {
  // UPDATE
  /////////////
  const gamepads = navigator.getGamepads();

  const paddleSpeed = 0.2;
  const controllerDeadzone = 0.1;

  const leftControllerLeftJoystick = gamepads[0]?.axes[1]; // -1 is up, 1 is down
  if (keysDown.has("w") || gamepads[0]?.buttons[12].pressed) {
    state.leftPaddleY -= paddleSpeed * dt;
  } else if (keysDown.has("s") || gamepads[0]?.buttons[13].pressed) {
    state.leftPaddleY += paddleSpeed * dt;
  } else if (
    leftControllerLeftJoystick &&
    Math.abs(leftControllerLeftJoystick) > controllerDeadzone
  ) {
    state.leftPaddleY += leftControllerLeftJoystick * paddleSpeed * dt;
  }

  const rightControllerLeftJoystick = gamepads[1]?.axes[1]; // -1 is up, 1 is down
  if (keysDown.has("ArrowUp") || gamepads[1]?.buttons[12].pressed) {
    state.rightPaddleY -= paddleSpeed * dt;
  } else if (keysDown.has("ArrowDown") || gamepads[1]?.buttons[13].pressed) {
    state.rightPaddleY += paddleSpeed * dt;
  } else if (
    rightControllerLeftJoystick &&
    Math.abs(rightControllerLeftJoystick) > controllerDeadzone
  ) {
    state.rightPaddleY += rightControllerLeftJoystick * paddleSpeed * dt;
  }

  state.leftPaddleY = Math.max(
    0,
    Math.min(300 - paddleHeight, state.leftPaddleY),
  );
  state.rightPaddleY = Math.max(
    0,
    Math.min(300 - paddleHeight, state.rightPaddleY),
  );

  state.ball.x += state.ball.dx * dt;
  state.ball.y += state.ball.dy * dt;

  if (state.ball.y - state.ballWidth * 0.5 < 0) {
    state.ball.dy = Math.abs(state.ball.dy);
    state.ball.y = 0 + state.ballWidth * 0.5;
  } else if (state.ball.y + state.ballWidth * 0.5 > 300) {
    state.ball.dy = -Math.abs(state.ball.dy);
    state.ball.y = 300 - state.ballWidth * 0.5;
  }

  if (
    state.ball.x - state.ballWidth * 0.5 < paddleWidth &&
    state.ball.y > state.leftPaddleY &&
    state.ball.y < state.leftPaddleY + paddleHeight
  ) {
    state.ball.dx = Math.abs(state.ball.dx);
    state.ball.x = paddleWidth + state.ballWidth * 0.5;
    // vibrate first controller
    gamepads[0]?.vibrationActuator?.playEffect("dual-rumble", {
      duration: 100,
      strongMagnitude: 1,
      weakMagnitude: 1,
    });
  } else if (
    state.ball.x + state.ballWidth * 0.5 > 400 - paddleWidth &&
    state.ball.y > state.rightPaddleY &&
    state.ball.y < state.rightPaddleY + paddleHeight
  ) {
    state.ball.dx = -Math.abs(state.ball.dx);
    state.ball.x = 400 - paddleWidth - state.ballWidth * 0.5;
  }

  if (state.ball.x < 0) {
    state.rightScore++;
    state.ball.x = 200;
    state.ball.y = 150;
    state.ball.dx = 0.1;
    state.ball.dy = 0.1;
  } else if (state.ball.x > 400) {
    state.leftScore++;
    state.ball.x = 200;
    state.ball.y = 150;
    state.ball.dx = -0.1;
    state.ball.dy = 0.1;
  }

  // DRAW
  /////////////
  const drawingRect = canvas.getBoundingClientRect();
  ctx.save();

  // letterboxed 4:3 centered
  const gameArea = (() => {
    const drawingRectRatio = drawingRect.width / drawingRect.height;
    const targetRatio = 4 / 3;
    const drawingRectWidth =
      drawingRectRatio > targetRatio
        ? drawingRect.height * targetRatio
        : drawingRect.width;
    const drawingRectHeight =
      drawingRectRatio > targetRatio
        ? drawingRect.height
        : drawingRect.width / targetRatio;
    return {
      x: drawingRect.width / 2 - drawingRectWidth / 2,
      y: drawingRect.height / 2 - drawingRectHeight / 2,
      width: drawingRectWidth,
      height: drawingRectHeight,
    };
  })();

  ctx.strokeStyle = "white";
  ctx.strokeRect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);
  const gameResolution = { width: 400, height: 300 };
  {
    ctx.save();
    ctx.translate(gameArea.x, gameArea.y);
    ctx.scale(
      gameArea.width / gameResolution.width,
      gameArea.height / gameResolution.height,
    );

    ctx.fillStyle = "white";
    ctx.fillRect(0, state.leftPaddleY, paddleWidth, paddleHeight);

    ctx.fillStyle = "white";
    ctx.fillRect(
      gameResolution.width - paddleWidth,
      state.rightPaddleY,
      paddleWidth,
      paddleHeight,
    );

    ctx.fillStyle = "white";
    ctx.fillRect(
      state.ball.x - state.ballWidth * 0.5,
      state.ball.y - state.ballWidth * 0.5,
      state.ballWidth,
      state.ballWidth,
    );
    ctx.restore();
  }

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    `${state.leftScore} - ${state.rightScore}`,
    gameArea.x + gameArea.width / 2,
    gameArea.y + 30,
  );

  ctx.restore();
}

const keysDown = new Set<string>();
window.addEventListener("keydown", (e) => {
  keysDown.add(e.key);
});
window.addEventListener("keyup", (e) => {
  keysDown.delete(e.key);
});
