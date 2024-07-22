import * as Pong from "./pong";
import * as BulletHell from "./bullet-hell";
import * as SetGame from "./set";
import * as AsyncChess from "./async-chess/versus";
import * as Stacker from "./stacker";
import { paused } from "./pause"; // TODO: decide if i actually care about pausing rn
import {
  Axes,
  Buttons,
  joystickJustMoved,
  justPressed,
  saveGamepadState,
} from "./controller";
import { playMenuChangeSound } from "./sound";

const games = [
  { name: "pong", logic: Pong },
  { name: "dodge", logic: BulletHell },
  { name: "set", logic: SetGame },
  { name: "async chess", logic: AsyncChess },
  { name: "stacker", logic: Stacker },
] as const;

const colors = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

const charsToChooseFrom = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ".split("");
let state = {
  state: "controller" as "controller" | "game",

  playerInfo: Array(4)
    .fill(null)
    .map((_, i) => ({
      name: `P${i + 1}  `.split(""),
      nameIndexEditing: 0,

      color: colors[i],
    })),

  game: null as null | (typeof games)[number],
  index: 0,
  animatedIndex: 0,
};
console.log(state);

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // UPDATE
  /////////////
  if (state.state === "controller") {
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
    });
  } else {
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad) => {
      if (!gamepad) return;
      if (justPressed(Buttons.START, gamepad)) {
        state.game = null;
        console.log("SET GAME TO NULL");
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
          state.game = games[intuitiveModulus(state.index, games.length)];
          saveGamepadState(); // reset just pressed for new game!
          state.game.logic.reset();
        }
      });
    } else {
      state.game.logic.update(dt);
    }
    state.animatedIndex += (state.index - state.animatedIndex) * 0.015 * dt;
  }

  // DRAW
  /////////////
  if (state.state === "controller") {
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
            y * gridSection.height +
              gridSection.height / 2 +
              gridSection.height,
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
  } else {
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
      state.game.logic.draw(canvas, ctx);
    }
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
  state.game = null;
}
