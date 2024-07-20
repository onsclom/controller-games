import { Buttons, justPressed } from "./controller";
import { returnToMenu } from "./menu";

const playersAmount = 2;
const playerColors = ["#ff0000", "#0000ff", "#00ff00", "#ffff00"];
const playerRadius = 2;
const bulletRadius = playerRadius * 0.5;
const enemyColor = "black";
const gameSize = {
  width: 160,
  height: 90,
};

const spawnIntervalStart = 70;
const spawnIntervalEnd = 15;

let state = createState();

function createState() {
  const playerSpacing = 10;
  return {
    players: Array.from({ length: playersAmount }, (_, i) => ({
      x: gameSize.width / 2 + i * playerSpacing - playerSpacing / 2,
      y: gameSize.height / 2,
      dead: false,
      deadTime: 0,
    })),
    bullets: [] as {
      x: number;
      y: number;
      speed: number;
    }[],
    timeToSimulateBulletSpawning: 0,
    roundTime: 0,
    spawnInterval: spawnIntervalStart,
  };
}

const keysDown = new Set();
document.addEventListener("keydown", (e) => keysDown.add(e.key));
document.addEventListener("keyup", (e) => keysDown.delete(e.key));

export function update(dt: number) {
  const allPlayersDead = state.players.every((player) => player.dead);
  if (allPlayersDead) {
    // if either player pressed start, start a new game
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad) => {
      if (!gamepad) return;
      if (justPressed(Buttons.A, gamepad)) {
        state = createState();
        returnToMenu();
      }
    });
  } else {
    state.timeToSimulateBulletSpawning += dt;
    state.roundTime += dt;
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < playersAmount; i++) {
      if (state.players[i].dead) continue;
      const gamepad = gamepads[i];
      if (!gamepad) continue;
      const moveDir = {
        x: gamepad.axes[0],
        y: gamepad.axes[1],
      };
      const player = state.players[i];
      const speed = Math.min(1, Math.sqrt(moveDir.x ** 2 + moveDir.y ** 2));
      const deadzone = 0.2;
      if (speed > deadzone) {
        player.x += moveDir.x * dt * 0.1;
        player.y += moveDir.y * dt * 0.1;
      }

      player.x = Math.max(
        0 + playerRadius,
        Math.min(gameSize.width - playerRadius, player.x),
      );
      player.y = Math.max(
        0 + playerRadius,
        Math.min(gameSize.height - playerRadius, player.y),
      );
    }

    const diffToTarget = spawnIntervalEnd - state.spawnInterval;
    state.spawnInterval += 0.0001 * dt * diffToTarget;
    while (state.timeToSimulateBulletSpawning > state.spawnInterval) {
      state.timeToSimulateBulletSpawning -= state.spawnInterval;
      state.bullets.push({
        x: Math.random() * gameSize.width,
        y: 0 - playerRadius,
        speed: Math.random() * 0.5 + 0.5,
      });
    }

    state.bullets.forEach((bullet, i) => {
      bullet.y += bullet.speed * dt * 0.05;
      state.players.forEach((player) => {
        if (player.dead) return;
        const distanceToPlayer = Math.sqrt(
          (bullet.x - player.x) ** 2 + (bullet.y - player.y) ** 2,
        );
        if (distanceToPlayer < playerRadius + bulletRadius) {
          player.dead = true;
          player.deadTime = state.roundTime;
        }
      });
    });
  }
}

export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
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
  state.players.forEach((player, i) => {
    ctx.save();
    ctx.fillStyle = playerColors[i];
    ctx.beginPath();
    ctx.globalAlpha = player.dead ? 0.2 : 1;
    ctx.roundRect(
      player.x - playerRadius,
      player.y - playerRadius,
      playerRadius * 2,
      playerRadius * 2,
      playerRadius,
    );
    ctx.fill();
    ctx.restore();
  });

  // draw bullets
  state.bullets.forEach((bullet, i) => {
    ctx.fillStyle = enemyColor;
    ctx.beginPath();
    ctx.roundRect(
      bullet.x - bulletRadius,
      bullet.y - bulletRadius,
      bulletRadius * 2,
      bulletRadius * 2,
      playerRadius,
    );
    ctx.fill();
  });

  // draw game time
  ctx.fillStyle = "white";
  ctx.font = "7px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `${Math.ceil(state.roundTime / 1000)}`,
    gameSize.width / 2,
    0 + 7,
  );

  const playersAlive = state.players.filter((player) => !player.dead);
  if (playersAlive.length === 0) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gameSize.width, gameSize.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "white";
    ctx.font = "5px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      state.players[0].deadTime > state.players[1].deadTime
        ? "red wins!"
        : "blue wins!",
      gameSize.width / 2,
      gameSize.height / 2,
    );
  }

  ctx.restore();
}
