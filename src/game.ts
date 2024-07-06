const gameStates = "countdown" as "countdown" | "playing" | "gameOver";
let leftScore = 0;
let rightScore = 0;

const paddleWidth = 10;
const paddleHeight = 100;
let leftPaddleY = 150 - 50;
let rightPaddleY = 150 - 50;

const ball = {
  x: 200,
  y: 150,
  dx: 0.1,
  dy: 0.1,
};
const ballRadius = 5;

export function gameUpdateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  /////////////
  if (keysDown.has("w")) {
    leftPaddleY -= 0.1 * dt;
  } else if (keysDown.has("s")) {
    leftPaddleY += 0.1 * dt;
  }

  if (keysDown.has("ArrowUp")) {
    rightPaddleY -= 0.1 * dt;
  } else if (keysDown.has("ArrowDown")) {
    rightPaddleY += 0.1 * dt;
  }
  // clamp paddle position
  leftPaddleY = Math.max(0, Math.min(300 - paddleHeight, leftPaddleY));
  rightPaddleY = Math.max(0, Math.min(300 - paddleHeight, rightPaddleY));

  ball.x += ball.dx * dt;
  ball.y += ball.dy * dt;
  // handle colission
  if (ball.y - ballRadius < 0) {
    ball.dy = Math.abs(ball.dy);
    ball.y = 0 + ballRadius;
  } else if (ball.y + ballRadius > 300) {
    ball.dy = -Math.abs(ball.dy);
    ball.y = 300 - ballRadius;
  }

  if (
    ball.x - ballRadius < paddleWidth &&
    ball.y > leftPaddleY &&
    ball.y < leftPaddleY + paddleHeight
  ) {
    ball.dx = Math.abs(ball.dx);
    ball.x = paddleWidth + ballRadius;
  } else if (
    ball.x + ballRadius > 400 - paddleWidth &&
    ball.y > rightPaddleY &&
    ball.y < rightPaddleY + paddleHeight
  ) {
    ball.dx = -Math.abs(ball.dx);
    ball.x = 400 - paddleWidth - ballRadius;
  }

  if (ball.x < 0) {
    rightScore++;
    ball.x = 200;
    ball.y = 150;
    ball.dx = 0.1;
    ball.dy = 0.1;
  } else if (ball.x > 400) {
    leftScore++;
    ball.x = 200;
    ball.y = 150;
    ball.dx = -0.1;
    ball.dy = 0.1;
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

  ctx.strokeStyle = "green";
  ctx.strokeRect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);
  {
    ctx.save();
    ctx.translate(gameArea.x, gameArea.y);
    ctx.scale(gameArea.width / 400, gameArea.height / 300);

    // draw left paddle
    ctx.fillStyle = "red";
    ctx.fillRect(0, leftPaddleY, 10, 100);

    // draw right paddle
    ctx.fillStyle = "blue";
    ctx.fillRect(390, rightPaddleY, 10, 100);

    // draw ball
    ctx.fillStyle = "purple";
    ctx.fillRect(
      ball.x - ballRadius,
      ball.y - ballRadius,
      ballRadius * 2,
      ballRadius * 2,
    );

    ctx.restore();
  }

  // draw score
  ctx.fillStyle = "green";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    `${leftScore} - ${rightScore}`,
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
