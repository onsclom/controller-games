import {
  Axes,
  Buttons,
  joystickJustMoved,
  justPressed,
  saveGamepadState,
} from "../controller";
import { playMenuChangeSound } from "../sound";
import { charsToChooseFrom } from "./constants";
import { games } from "./games";
import type { State } from "./state";

export function update(state: State, dt: number) {
  switch (state.menu) {
    case "controller":
      updateControllerMenu(state, dt);
      break;
    case "game":
      updateGameMenu(state, dt);
      break;
  }
}

export function draw(
  state: State,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  switch (state.menu) {
    case "controller":
      drawControllerMenu(state, canvas, ctx);
      break;
    case "game":
      drawGameMenu(state, canvas, ctx);
      break;
  }
}

function updateControllerMenu(state: State, dt: number) {
  const gamepads = navigator.getGamepads();
  gamepads.forEach((gamepad) => {
    if (!gamepad) return;
    if (
      justPressed(Buttons.DPAD_LEFT, gamepad) ||
      joystickJustMoved(Axes.LEFT_STICK_X, -1, gamepad)
    ) {
      state.playerInfo[gamepad.index].nameIndexEditing--;
      playMenuChangeSound();
    }
    if (
      justPressed(Buttons.DPAD_RIGHT, gamepad) ||
      joystickJustMoved(Axes.LEFT_STICK_X, 1, gamepad)
    ) {
      state.playerInfo[gamepad.index].nameIndexEditing++;
      playMenuChangeSound();
    }

    state.playerInfo[gamepad.index].nameIndexEditing = intuitiveModulus(
      state.playerInfo[gamepad.index].nameIndexEditing,
      state.playerInfo[gamepad.index].name.length,
    );

    const playerInfo = state.playerInfo[gamepad.index];
    const currentLetterIndex = charsToChooseFrom.indexOf(
      playerInfo.name[playerInfo.nameIndexEditing],
    );
    if (
      justPressed(Buttons.DPAD_DOWN, gamepad) ||
      joystickJustMoved(Axes.LEFT_STICK_Y, 1, gamepad)
    ) {
      playerInfo.name[playerInfo.nameIndexEditing] =
        charsToChooseFrom[
          intuitiveModulus(currentLetterIndex + 1, charsToChooseFrom.length)
        ];
      playMenuChangeSound();
    }
    if (
      justPressed(Buttons.DPAD_UP, gamepad) ||
      joystickJustMoved(Axes.LEFT_STICK_Y, -1, gamepad)
    ) {
      playerInfo.name[playerInfo.nameIndexEditing] =
        charsToChooseFrom[
          intuitiveModulus(currentLetterIndex - 1, charsToChooseFrom.length)
        ];
      playMenuChangeSound();
    }

    if (justPressed(Buttons.START, gamepad)) {
      state.menu = "game";
      playMenuChangeSound();
    }
  });
}

function updateGameMenu(state: State, dt: number) {
  const gamepads = navigator.getGamepads();
  gamepads.forEach((gamepad) => {
    if (!gamepad) return;
    if (justPressed(Buttons.START, gamepad)) {
      state.game = null;
    }
  });

  if (!state.game) {
    gamepads.forEach((gamepad) => {
      if (!gamepad) return;
      if (
        justPressed(Buttons.DPAD_DOWN, gamepad) ||
        joystickJustMoved(Axes.LEFT_STICK_Y, 1, gamepad)
      ) {
        state.index++;
        playMenuChangeSound();
      }
      if (
        justPressed(Buttons.DPAD_UP, gamepad) ||
        joystickJustMoved(Axes.LEFT_STICK_Y, -1, gamepad)
      ) {
        state.index--;
        playMenuChangeSound();
      }
      if (justPressed(Buttons.A, gamepad)) {
        state.game = intuitiveModulus(state.index, games.length);
        saveGamepadState(); // reset just pressed for new game!
        games[state.game].logic.reset();
      }

      if (justPressed(Buttons.B, gamepad)) {
        state.menu = "controller";
        playMenuChangeSound();
      }
    });
  } else {
    games[state.game].logic.update(dt);
  }
  state.animatedIndex += (state.index - state.animatedIndex) * 0.015 * dt;
}

function drawControllerMenu(
  state: State,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  const gamepads = navigator.getGamepads();
  const drawingArea = canvas.getBoundingClientRect();
  const sectionWidth = drawingArea.width / gamepads.length;
  ctx.strokeStyle = "white";
  gamepads.forEach((gamepad, i) => {
    const playerRect = {
      x: sectionWidth * i,
      y: 0,
      width: sectionWidth,
      height: drawingArea.height,
    };
    ctx.strokeRect(
      playerRect.x,
      playerRect.y,
      playerRect.width,
      playerRect.height,
    );

    if (!gamepad) {
      // draw text (not connected)
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Not Connected",
        playerRect.x + playerRect.width / 2,
        playerRect.y + playerRect.height / 2,
      );
    } else {
      // // draw name
      // ctx.fillStyle = "white";
      // ctx.font = "30px Arial";
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // ctx.fillText(
      //   state.playerInfo[i].name.join(""),
      //   playerRect.x + playerRect.width / 2,
      //   playerRect.y + playerRect.height / 2,
      // );
      ctx.save();
      ctx.translate(playerRect.x, playerRect.y);

      const gridSection = {
        width: 50,
        height: 50,
      };
      const grid = {
        widthParts: 4,
        heightParts: 3,
      };
      const gridRect = {
        width: grid.widthParts * gridSection.width,
        height: grid.heightParts * gridSection.height,
      };

      ctx.strokeStyle = "white";
      ctx.translate(
        playerRect.width / 2 - gridRect.width / 2,
        playerRect.height / 2 - gridRect.height / 2,
      );
      ctx.strokeRect(0, 0, gridRect.width, gridRect.height);

      const name = state.playerInfo[i].name;
      name.forEach((letter, i) => {
        ctx.fillStyle = state.playerInfo[gamepad.index].color;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const x = i % grid.widthParts;
        const y = Math.floor(i / grid.widthParts);
        ctx.fillText(
          letter,
          x * gridSection.width + gridSection.width / 2,
          y * gridSection.height + gridSection.height / 2 + gridSection.height,
        );
      });

      const indexEditing = state.playerInfo[i].nameIndexEditing;
      // "^" "v"

      ctx.fillText(
        "↑",
        indexEditing * gridSection.width + gridSection.width / 2,
        gridSection.height / 2,
      );
      ctx.fillText(
        "↓",
        indexEditing * gridSection.width + gridSection.width / 2,
        gridSection.height / 2 + gridSection.height * 2,
      );

      // Array(grid.heightParts)
      //   .fill(null)
      //   .forEach((_, y) => {
      //     Array(grid.widthParts)
      //       .fill(null)
      //       .forEach((_, x) => {
      //         ctx.strokeRect(
      //           x * gridSection.width,
      //           y * gridSection.height,
      //           gridSection.width,
      //           gridSection.height,
      //         );
      //       });
      //   });

      ctx.restore();
    }
  });
}

function drawGameMenu(
  state: State,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  if (!state.game) {
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
    ctx.filter = `blur(${Math.abs(state.index - state.animatedIndex) * 2}px)`;
    {
      const animatedIndexFloored = Math.floor(state.animatedIndex);
      for (let i = 0; i < totalToDraw; i++) {
        const gameIndex = intuitiveModulus(
          animatedIndexFloored + i - centerOffset,
          gameNames.length,
        );
        const animatedDecimal = state.animatedIndex - animatedIndexFloored;
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
  } else {
    games[state.game].logic.draw(canvas, ctx);
  }
}

function intuitiveModulus(n: number, m: number) {
  // it handles negatives the way you would expect
  return ((n % m) + m) % m;
}

// export function returnToMenu() {
//   state.game = null;
// }
