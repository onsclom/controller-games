const playersAmount = 4;
const playerColors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
const gameSize = {
  width: 160,
  height: 90,
};
const playerRadius = 4;

const gameState = {
  playerPositions: Array.from({ length: playersAmount }, () => ({
    x: gameSize.width / 2,
    y: gameSize.height / 2,
  })),
};

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  /////////////
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < playersAmount; i++) {
    const gamepad = gamepads[i];
    if (!gamepad) continue;
    const moveDir = {
      x: gamepad.axes[0],
      y: gamepad.axes[1],
    };
    const player = gameState.playerPositions[i];
    const angle = Math.atan2(moveDir.y, moveDir.x);
    const speed = Math.min(1, Math.sqrt(moveDir.x ** 2 + moveDir.y ** 2));
    const deadzone = 0.2;
    if (speed > deadzone) {
      player.x += moveDir.x * dt * 0.1;
      player.y += moveDir.y * dt * 0.1;
    }
  }

  // DRAW
  /////////////

  // make letterboxed area
  const gameArea = (() => {
    const drawingRect = canvas.getBoundingClientRect();
    const drawingRectRatio = drawingRect.width / drawingRect.height;
    const targetRatio = gameSize.width / gameSize.height;
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

  ctx.fillStyle = "#333";
  ctx.save();
  ctx.translate(gameArea.x, gameArea.y);
  ctx.scale(gameArea.width / gameSize.width, gameArea.height / gameSize.height);
  ctx.fillRect(0, 0, gameSize.width, gameSize.height);

  // draw players
  gameState.playerPositions.forEach((player, i) => {
    ctx.fillStyle = playerColors[i];
    // ctx.fillRect(
    //   player.x - playerRadius / 2,
    //   player.y - playerRadius / 2,
    //   playerRadius,
    //   playerRadius,
    // );
    // roundrect
    ctx.beginPath();
    ctx.roundRect(
      player.x - playerRadius,
      player.y - playerRadius,
      playerRadius * 2,
      playerRadius * 2,
      playerRadius,
    );
    ctx.fill();
  });

  ctx.restore();
}

// for development
const keysDown = new Set<string>();
window.addEventListener("keydown", (e) => {
  keysDown.add(e.key);
});
window.addEventListener("keyup", (e) => {
  keysDown.delete(e.key);
});
