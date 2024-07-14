import { playBounceSound, playHitSound, playScoreSound } from "./sound";

const gameResolution = { width: 400, height: 300 };
const paddleWidth = 10;
const paddleHeight = 70;
const startSpeed = 0.3;
const maxSpeed = 2.0;
const speedApproachFactor = 0.05;
const pointsToWin = 11;
const paddleSpeed = 0.5;
const controllerDeadzone = 0.2;
const ballTrailParts = 100;
const physicFramesPerSecond = 1000;
const playersControlAngle = true;

let state = createState();

export function createState() {
  const state = {
    type: "startScreen" as "startScreen" | "countdown" | "playing",
    countdown: 3000,
    newRound: false,

    leftScore: 0,
    rightScore: 0,
    leftPaddleY: gameResolution.height / 2 - paddleHeight / 2,
    rightPaddleY: gameResolution.height / 2 - paddleHeight / 2,
    ball: {
      x: gameResolution.width / 2,
      y: gameResolution.height / 2,
      dx: 0,
      dy: 0,
      speed: startSpeed,
      trail: Array.from({ length: ballTrailParts }).map(() => ({
        x: gameResolution.width / 2,
        y: gameResolution.height / 2,
      })),
      scale: 1,
    },
    ballWidth: 10,
    timeToSimulate: 0,

    cameraOffset: {
      x: 0,
      y: 0,
    },
  };
  startNewRound(state);
  return state;
}

function startNewRound(state: ReturnType<typeof createState>) {
  state.ball.x = 200;
  state.ball.y = 150;
  const possibleDxs = [-1, 1];
  const possibleDys = [-1, 1];
  state.ball.dx =
    Math.cos(Math.PI / 4) *
    possibleDxs[Math.floor(Math.random() * possibleDxs.length)];
  state.ball.dy =
    Math.sin(Math.PI / 4) *
    possibleDys[Math.floor(Math.random() * possibleDys.length)];
  state.ball.speed = startSpeed;
  state.leftPaddleY = gameResolution.height / 2 - paddleHeight / 2;
  state.rightPaddleY = gameResolution.height / 2 - paddleHeight / 2;
}

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  /////////////
  state.timeToSimulate += dt;
  let stepsToSimulate = Math.floor(
    state.timeToSimulate / (1000 / physicFramesPerSecond),
  );

  if (stepsToSimulate > 0) {
    state.timeToSimulate -= stepsToSimulate * (1000 / physicFramesPerSecond);
    if (state.newRound) {
      startNewRound(state);
      state.newRound = false;
      if (state.leftScore >= pointsToWin || state.rightScore >= pointsToWin) {
        // reset game!
        state = createState();
      }
    }
  }

  const gamepads = navigator.getGamepads();
  for (let i = 0; i < stepsToSimulate; i++) {
    const dt = 1000 / physicFramesPerSecond;
    switch (state.type) {
      case "startScreen":
        // press start to play
        for (const gamepad of gamepads) {
          if (gamepad?.buttons[9].pressed || keysDown.has("Enter")) {
            state.type = "countdown";
          }
        }
        break;
      case "countdown":
        state.countdown -= dt;
        if (state.countdown <= 0) {
          state.type = "playing";
        }
        break;
      case "playing": {
        const leftControllerLeftJoystick = gamepads[0]?.axes[1]; // -1 is up, 1 is down
        if (keysDown.has("w") || gamepads[0]?.buttons[12].pressed) {
          state.leftPaddleY -= paddleSpeed * dt;
        } else if (keysDown.has("s") || gamepads[0]?.buttons[13].pressed) {
          state.leftPaddleY += paddleSpeed * dt;
        } else if (
          leftControllerLeftJoystick &&
          Math.abs(leftControllerLeftJoystick) > controllerDeadzone
        ) {
          const amount =
            (leftControllerLeftJoystick - controllerDeadzone) /
            (1 - controllerDeadzone);
          state.leftPaddleY += amount * paddleSpeed * dt;
        }

        const rightControllerLeftJoystick = gamepads[1]?.axes[1]; // -1 is up, 1 is down
        if (keysDown.has("ArrowUp") || gamepads[1]?.buttons[12].pressed) {
          state.rightPaddleY -= paddleSpeed * dt;
        } else if (
          keysDown.has("ArrowDown") ||
          gamepads[1]?.buttons[13].pressed
        ) {
          state.rightPaddleY += paddleSpeed * dt;
        } else if (
          rightControllerLeftJoystick &&
          Math.abs(rightControllerLeftJoystick) > controllerDeadzone
        ) {
          const amount =
            (rightControllerLeftJoystick - controllerDeadzone) /
            (1 - controllerDeadzone);
          state.rightPaddleY += amount * paddleSpeed * dt;
        }

        state.leftPaddleY = Math.max(
          0,
          Math.min(300 - paddleHeight, state.leftPaddleY),
        );
        state.rightPaddleY = Math.max(
          0,
          Math.min(300 - paddleHeight, state.rightPaddleY),
        );

        const prevBallPos = { x: state.ball.x, y: state.ball.y };
        state.ball.x += state.ball.dx * dt * state.ball.speed;
        state.ball.y += state.ball.dy * dt * state.ball.speed;

        const ballScaleUp = 0.75;
        const cameraShakeForce = 10 * state.ball.speed;

        if (state.ball.y - state.ballWidth * 0.5 < 0) {
          state.ball.dy = Math.abs(state.ball.dy);
          state.ball.y = 0 + state.ballWidth * 0.5;
          playBounceSound();
          state.cameraOffset.y -= cameraShakeForce;
          state.ball.scale += ballScaleUp;
        } else if (state.ball.y + state.ballWidth * 0.5 > 300) {
          state.ball.dy = -Math.abs(state.ball.dy);
          state.ball.y = 300 - state.ballWidth * 0.5;
          playBounceSound();
          state.cameraOffset.y += cameraShakeForce;
          state.ball.scale += ballScaleUp;
        }

        const leniency = 20; // additional space to make paddles bigger
        const freezeTime = 45 + state.ball.speed * 45;
        if (
          state.ball.x - state.ballWidth * 0.5 < paddleWidth &&
          state.ball.y - state.ballWidth * 0.5 + leniency > state.leftPaddleY &&
          state.ball.y + state.ballWidth * 0.5 - leniency <
            state.leftPaddleY + paddleHeight
        ) {
          playHitSound();
          state.timeToSimulate -= freezeTime;
          if (playersControlAngle) {
            const ballDistanceFromPaddleCenter =
              state.ball.y - (state.leftPaddleY + paddleHeight / 2);
            const angle =
              (Math.PI / 4) *
              (ballDistanceFromPaddleCenter / (paddleHeight / 2));
            state.ball.dx = Math.cos(angle);
            state.ball.dy = Math.sin(angle);
          } else {
            state.ball.dx = Math.abs(state.ball.dx);
          }
          state.ball.x = paddleWidth + state.ballWidth * 0.5;
          gamepads[0]?.vibrationActuator?.playEffect("dual-rumble", {
            duration: freezeTime,
            strongMagnitude: 1,
            weakMagnitude: 1,
          });
          const targetSpeedDiff = maxSpeed - state.ball.speed;
          state.ball.speed += targetSpeedDiff * speedApproachFactor;
          state.cameraOffset.x -= cameraShakeForce;
          state.ball.scale += 0.5;
        } else if (
          state.ball.x + state.ballWidth * 0.5 > 400 - paddleWidth &&
          state.ball.y - state.ballWidth * 0.5 + leniency >
            state.rightPaddleY &&
          state.ball.y + state.ballWidth * 0.5 - leniency <
            state.rightPaddleY + paddleHeight
        ) {
          playHitSound();
          state.timeToSimulate -= freezeTime;
          if (playersControlAngle) {
            const ballDistanceFromPaddleCenter =
              state.ball.y - (state.rightPaddleY + paddleHeight / 2);
            const angle =
              (Math.PI / 4) *
              (ballDistanceFromPaddleCenter / (paddleHeight / 2));
            state.ball.dx = -Math.cos(angle);
            state.ball.dy = Math.sin(angle);
          } else {
            state.ball.dx = -Math.abs(state.ball.dx);
          }
          state.ball.x = 400 - paddleWidth - state.ballWidth * 0.5;
          gamepads[1]?.vibrationActuator?.playEffect("dual-rumble", {
            duration: freezeTime,
            strongMagnitude: 1,
            weakMagnitude: 1,
          });
          const targetSpeedDiff = maxSpeed - state.ball.speed;
          state.ball.speed += targetSpeedDiff * speedApproachFactor;
          state.cameraOffset.x += cameraShakeForce;
          state.ball.scale += 0.5;
        }

        state.ball.trail.push({
          x: prevBallPos.x,
          y: prevBallPos.y,
        });
        const winFreeze = 350;
        if (state.ball.x - state.ballWidth * 0.5 < 0) {
          state.rightScore++;
          playScoreSound();
          state.timeToSimulate -= winFreeze;
          state.newRound = true;
          stepsToSimulate = 0;
        } else if (state.ball.x + state.ballWidth * 0.5 > 400) {
          state.leftScore++;
          playScoreSound();
          state.timeToSimulate -= winFreeze;
          state.newRound = true;
          stepsToSimulate = 0;
        }

        while (state.ball.trail.length > ballTrailParts) {
          state.ball.trail.shift();
        }

        const cameraYDiff = 0 - state.cameraOffset.y;
        state.cameraOffset.y += cameraYDiff * 0.01 * dt;
        const cameraXDiff = 0 - state.cameraOffset.x;
        state.cameraOffset.x += cameraXDiff * 0.01 * dt;
        const ballScaleDiff = 1 - state.ball.scale;
        state.ball.scale += ballScaleDiff * 0.01 * dt;
        break;
      }

      default:
        throw new Error(`Unhandled state: ${state}`);
    }
  }

  // DRAW
  /////////////
  const drawingRect = canvas.getBoundingClientRect();
  ctx.save();

  // letterboxed 4:3 centered
  const margin = 25;
  const gameArea = (() => {
    const marginWidth = drawingRect.width - margin * 2;
    const marginHeight = drawingRect.height - margin * 2;
    const drawingRectRatio = marginWidth / marginHeight;
    const targetRatio = 4 / 3;
    const drawingRectWidth =
      drawingRectRatio > targetRatio ? marginHeight * targetRatio : marginWidth;
    const drawingRectHeight =
      drawingRectRatio > targetRatio ? marginHeight : marginWidth / targetRatio;
    return {
      x: drawingRect.width / 2 - drawingRectWidth / 2,
      y: drawingRect.height / 2 - drawingRectHeight / 2,
      width: drawingRectWidth,
      height: drawingRectHeight,
    };
  })();

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, drawingRect.width, drawingRect.height);
  ctx.fillStyle = "#333";

  ctx.save();
  ctx.translate(gameArea.x, gameArea.y);
  ctx.scale(
    gameArea.width / gameResolution.width,
    gameArea.height / gameResolution.height,
  );
  ctx.translate(state.cameraOffset.x, state.cameraOffset.y);
  ctx.fillRect(0, 0, gameResolution.width, gameResolution.height);

  ctx.beginPath();
  ctx.rect(0, 0, gameResolution.width, gameResolution.height);
  ctx.clip();

  switch (state.type) {
    case "startScreen":
      // draw text "press start to play"
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "press start to play",
        gameResolution.width / 2,
        gameResolution.height / 2,
      );
      break;
    default:
      ctx.fillStyle = "white";
      ctx.fillRect(0, state.leftPaddleY, paddleWidth, paddleHeight);

      ctx.fillStyle = "white";
      ctx.fillRect(
        gameResolution.width - paddleWidth,
        state.rightPaddleY,
        paddleWidth,
        paddleHeight,
      );

      if (state.type !== "countdown") {
        ctx.fillStyle = "white";
        ctx.fillRect(
          state.ball.x - state.ballWidth * state.ball.scale * 0.5,
          state.ball.y - state.ballWidth * state.ball.scale * 0.5,
          state.ballWidth * state.ball.scale,
          state.ballWidth * state.ball.scale,
        );

        state.ball.trail.forEach((trailItem, index) => {
          ctx.fillStyle = "white";
          const scale = (index / state.ball.trail.length) * 0.5 + 0.5;
          ctx.fillRect(
            trailItem.x - state.ballWidth * state.ball.scale * 0.5 * scale,
            trailItem.y - state.ballWidth * state.ball.scale * 0.5 * scale,
            state.ballWidth * state.ball.scale * scale,
            state.ballWidth * state.ball.scale * scale,
          );
        });
      }
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";

      if (state.countdown === 0) {
        ctx.fillText(
          `${state.leftScore} - ${state.rightScore}`,
          gameResolution.width / 2,
          30,
        );
      }

      ctx.restore();

      if (state.countdown > 0) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, drawingRect.width, drawingRect.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.font = "100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${Math.ceil(state.countdown / 1000)}`,
          drawingRect.width / 2,
          drawingRect.height / 2,
        );
      }
  }

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
