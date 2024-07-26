export const Buttons = {
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  START: 9,
  SELECT: 8,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  LEFT_SHOULDER: 4,
  RIGHT_SHOULDER: 5,
  LEFT_TRIGGER: 6, // value is between 0 and 1
  RIGHT_TRIGGER: 7, // value is between 0 and 1
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
};

export const Axes = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
};

const previousGamepadButtonsDown = [
  new Set<number>(),
  new Set<number>(),
  new Set<number>(),
  new Set<number>(),
];

const previousGamepadAxes = new Array(4).fill(0).map(() => ({
  [Axes.LEFT_STICK_X]: 0,
  [Axes.LEFT_STICK_Y]: 0,
  [Axes.RIGHT_STICK_X]: 0,
  [Axes.RIGHT_STICK_Y]: 0,
}));

/* we need to save gamepad state to be able to detect when a button is just pressed or just released */
export function saveGamepadState() {
  navigator.getGamepads().forEach((gamepad, i) => {
    previousGamepadButtonsDown[i].clear();
    if (!gamepad) return;
    previousGamepadButtonsDown[i] = new Set(
      gamepad.buttons.map((button, index) => (button.pressed ? index : -1)),
    );
    previousGamepadAxes[i][Axes.LEFT_STICK_X] = gamepad.axes[Axes.LEFT_STICK_X];
    previousGamepadAxes[i][Axes.LEFT_STICK_Y] = gamepad.axes[Axes.LEFT_STICK_Y];
    previousGamepadAxes[i][Axes.RIGHT_STICK_X] =
      gamepad.axes[Axes.RIGHT_STICK_X];
    previousGamepadAxes[i][Axes.RIGHT_STICK_Y] =
      gamepad.axes[Axes.RIGHT_STICK_Y];
  });
}

export function justPressed(button: number, gamepad: Gamepad) {
  return (
    gamepad.buttons[button].pressed &&
    !previousGamepadButtonsDown[gamepad.index].has(button)
  );
}

export function justReleased(button: number, gamepad: Gamepad) {
  return (
    !gamepad.buttons[button].pressed &&
    previousGamepadButtonsDown[gamepad.index].has(button)
  );
}

export function joystickJustMoved(axis: number, dir: 1 | -1, gamepad: Gamepad) {
  const sensitivity = 0.5;
  const curVal = gamepad.axes[axis];
  const joystickInDirection =
    dir === 1 ? curVal > sensitivity : curVal < -sensitivity;
  const previousVal = previousGamepadAxes[gamepad.index][axis];
  const joystickWasNotInDirection =
    dir === 1 ? previousVal <= sensitivity : previousVal >= -sensitivity;
  return joystickInDirection && joystickWasNotInDirection;
}

// if is dev, allow keyboard input by monkeypatching navigator.getGamepads
if (import.meta.env.DEV) {
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[0];
  const keyboardGamepad = {
    index: 0,
    buttons: new Array(16).fill(0).map(() => ({ pressed: false })),
    axes: new Array(4).fill(0),
  };
  // @ts-expect-error
  navigator.getGamepads = () => {
    return gamepads[0] ? gamepads : [keyboardGamepad, ...gamepads.slice(1)];
  };
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      keyboardGamepad.buttons[Buttons.DPAD_UP].pressed = true;
    }
    if (e.key === "ArrowDown") {
      keyboardGamepad.buttons[Buttons.DPAD_DOWN].pressed = true;
    }
    if (e.key === "ArrowLeft") {
      keyboardGamepad.buttons[Buttons.DPAD_LEFT].pressed = true;
    }
    if (e.key === "ArrowRight") {
      keyboardGamepad.buttons[Buttons.DPAD_RIGHT].pressed = true;
    }
    if (e.key === "Enter") {
      keyboardGamepad.buttons[Buttons.START].pressed = true;
    }
    if (e.key === " ") {
      keyboardGamepad.buttons[Buttons.A].pressed = true;
    }
    if (e.key === "Escape") {
      keyboardGamepad.buttons[Buttons.B].pressed = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") {
      keyboardGamepad.buttons[Buttons.DPAD_UP].pressed = false;
    }
    if (e.key === "ArrowDown") {
      keyboardGamepad.buttons[Buttons.DPAD_DOWN].pressed = false;
    }
    if (e.key === "ArrowLeft") {
      keyboardGamepad.buttons[Buttons.DPAD_LEFT].pressed = false;
    }
    if (e.key === "ArrowRight") {
      keyboardGamepad.buttons[Buttons.DPAD_RIGHT].pressed = false;
    }
    if (e.key === "Enter") {
      keyboardGamepad.buttons[Buttons.START].pressed = false;
    }
    if (e.key === " ") {
      keyboardGamepad.buttons[Buttons.A].pressed = false;
    }
    if (e.key === "Escape") {
      keyboardGamepad.buttons[Buttons.B].pressed = false;
    }
  });
}
