import { Axes, Buttons, joystickJustMoved, justPressed } from "../controller";

const colors = ["red", "green", "blue"] as const;
const fills = ["solid", "dashed", "outline"] as const;
const counts = [1, 2, 3] as const;
const shapes = ["S", "O", "diamond"] as const;
const cardsPerRow = 4;
const cardRadius = 10;

function createState() {
  const deck = generateAllCards();
  shuffleCards(deck);
  const board = deck.splice(0, 12);
  return {
    countDown: 3000,

    board,
    deck,

    left: {
      color: "pink",
      won: [] as Card[],
      cursor: {
        x: 0,
        y: 0,
      },
      selected: [] as Card[],
    },

    right: {
      color: "yellow",
      won: [] as Card[],
      cursor: {
        x: 1,
        y: 0,
      },
      selected: [] as Card[],
    },
  };
}

let state = createState();
export function reset() {
  state = createState();
}

const controlToDirection = [
  {
    dpad: Buttons.DPAD_LEFT,
    dir: { x: -1, y: 0 },
    joystick: Axes.LEFT_STICK_X,
    joystickDir: -1,
  },
  {
    dpad: Buttons.DPAD_RIGHT,
    dir: { x: 1, y: 0 },
    joystick: Axes.LEFT_STICK_X,
    joystickDir: 1,
  },
  {
    dpad: Buttons.DPAD_UP,
    dir: { x: 0, y: -1 },
    joystick: Axes.LEFT_STICK_Y,
    joystickDir: -1,
  },
  {
    dpad: Buttons.DPAD_DOWN,
    dir: { x: 0, y: 1 },
    joystick: Axes.LEFT_STICK_Y,
    joystickDir: 1,
  },
] as const;

const playerToGamepad = {
  left: 0,
  right: 1,
};

export function update(dt: number) {
  const gamepads = navigator.getGamepads();
  for (const side of ["left", "right"] as const) {
    const gamepad = gamepads[playerToGamepad[side]];
    if (!gamepad) return;

    const rows = Math.ceil(state.board.length / 4);
    const cols = Math.min(4, state.board.length);
    justPressed(Buttons.DPAD_LEFT, gamepad);
    for (const {
      dpad: button,
      dir: direction,
      joystick,
      joystickDir,
    } of controlToDirection) {
      if (
        justPressed(button, gamepad) ||
        joystickJustMoved(joystick, joystickDir, gamepad)
      ) {
        const player = state[side];

        player.cursor.x = intuitiveModulus(player.cursor.x + direction.x, cols);
        player.cursor.y = intuitiveModulus(player.cursor.y + direction.y, rows);
      }
    }

    if (justPressed(Buttons.A, gamepad)) {
      const player = state[side];
      const card = state.board[player.cursor.y * cardsPerRow + player.cursor.x];
      if (player.selected.includes(card)) {
        player.selected = player.selected.filter((c) => c !== card);
      } else {
        player.selected.push(card);
      }

      if (player.selected.length === 3) {
        if (isSet(player.selected)) {
          player.won.push(...player.selected);
          const otherPlayer = state[side === "left" ? "right" : "left"];
          otherPlayer.selected = otherPlayer.selected.filter(
            (c) => !player.selected.includes(c),
          );
          player.selected.forEach((card) => {
            const index = state.board.indexOf(card);
            const topOfDeck = state.deck.pop();
            if (topOfDeck) {
              state.board.splice(index, 1, topOfDeck);
            } else {
              state.board.splice(index, 1);
            }
          });
          player.selected.length = 0;

          // check how many sets are on the board
          const cardCombinations = combinations(state.board, 3);
          const setCombos = cardCombinations.filter(isSet);
        } else {
          player.selected.length = 0;
        }
      }
    }
  }
}

function combinations(arr: Card[], k: number) {
  const n = arr.length;
  const result: Card[][] = [];
  function helper(start: number, current: Card[]) {
    if (current.length === k) {
      if (isSet(current)) {
        result.push(current.slice());
      }
      return;
    }

    for (let i = start; i < n; i++) {
      current.push(arr[i]);
      helper(i + 1, current);
      current.pop();
    }
  }

  helper(0, []);
  return result;
}

// const deck = generateAllCards();
// shuffleCards(deck);
export function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const cardGap = 22;
  const boardWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardGap;
  const rows = Math.ceil(state.board.length / cardsPerRow);
  const boardHeight = rows * cardHeight + (rows - 1) * cardGap;

  const drawingRect = canvas.getBoundingClientRect();

  drawDeck(ctx, state.deck);

  ctx.translate(
    drawingRect.width / 2 - boardWidth / 2,
    drawingRect.height / 2 - boardHeight / 2,
  );
  state.board.forEach((card, i) => {
    ctx.save();
    ctx.translate(
      (i % cardsPerRow) * (cardWidth + cardGap),
      Math.floor(i / cardsPerRow) * (cardHeight + cardGap),
    );
    drawCard(ctx, card);
    const selectedCircleRadius = 30;
    const leftPlayerSelected = state.left.selected.includes(card);
    if (leftPlayerSelected) {
      ctx.fillStyle = state.left.color;
      ctx.beginPath();
      ctx.roundRect(
        0,
        0,
        selectedCircleRadius,
        selectedCircleRadius,
        selectedCircleRadius,
      );
      ctx.fill();
    }
    const rightPlayerSelected = state.right.selected.includes(card);
    if (rightPlayerSelected) {
      ctx.fillStyle = state.right.color;
      ctx.beginPath();
      ctx.roundRect(
        cardWidth - selectedCircleRadius,
        0,
        selectedCircleRadius,
        selectedCircleRadius,
        selectedCircleRadius,
      );
      ctx.fill();
    }
    ctx.restore();
  });

  // draw cursors
  const cursorsAreSamePos =
    state.left.cursor.x === state.right.cursor.x &&
    state.left.cursor.y === state.right.cursor.y;
  for (const side of ["left", "right"] as const) {
    const player = state[side];
    ctx.save();
    ctx.translate(
      player.cursor.x * (cardWidth + cardGap),
      player.cursor.y * (cardHeight + cardGap),
    );
    ctx.strokeStyle = player.color;

    ctx.lineWidth = 6;
    const gap = side === "right" && cursorsAreSamePos ? 6 + 9 : 6;

    ctx.beginPath();
    ctx.roundRect(
      0 - gap,
      0 - gap,
      cardWidth + gap * 2,
      cardHeight + gap * 2,
      cardRadius + gap,
    );
    ctx.stroke();
    ctx.restore();
  }
}

function generateAllCards() {
  const cards = [];
  for (const color of colors) {
    for (const fill of fills) {
      for (const count of counts) {
        for (const shape of shapes) {
          cards.push({ color, fill, count, shape });
        }
      }
    }
  }
  return cards;
}

function shuffleCards(cards: Card[]) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

type Card = ReturnType<typeof generateAllCards>[number];

const isSet = (cards: Card[]) =>
  cards.length === 3 &&
  (["color", "fill", "count", "shape"] as const)
    .map((key) => new Set(cards.map((card) => card[key])))
    .every((set) => set.size === 1 || set.size === 3);

const shapeDrawers = {
  S: drawS,
  O: drawO,
  diamond: drawDiamond,
};
const cardWidth = 150;
const cardHeight = 100;
const shapeWidth = 30;
const shapeHeight = 75;
const shapeGap = 15;
function drawCard(ctx: CanvasRenderingContext2D, card: Card) {
  // draw a white round rect
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.roundRect(0, 0, cardWidth, cardHeight, cardRadius);
  ctx.fill();

  ctx.save();
  const cardCenter = {
    x: cardWidth / 2,
    y: cardHeight / 2,
  };
  const gapAmount = (card.count - 1) * shapeGap;
  ctx.translate(
    cardCenter.x - 0.5 * (shapeWidth * card.count + gapAmount),
    cardCenter.y - shapeHeight / 2,
  );
  for (let i = 0; i < card.count; i++) {
    ctx.save();
    ctx.translate(i * (shapeGap + shapeWidth), 0);
    shapeDrawers[card.shape](ctx, card.color, card.fill);
    ctx.restore();
  }
  ctx.restore();
}

function drawDeck(ctx: CanvasRenderingContext2D, deck: Card[]) {
  ctx.save();
  for (const card of deck) {
    ctx.translate(1, 1);
    drawCard(ctx, card);
  }
  ctx.restore();
}

function drawS(
  ctx: CanvasRenderingContext2D,
  color: Card["color"],
  fill: Card["fill"],
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(0, 0, shapeWidth, shapeHeight);
  ctx.closePath();
  if (fill === "outline") ctx.stroke();
  if (fill === "solid") {
    ctx.stroke();
    ctx.fill();
  }
  if (fill === "dashed") {
    ctx.save();
    ctx.stroke();
    ctx.clip();

    const dashGap = 3.5;
    for (let lineY = 0; lineY <= shapeHeight; lineY += dashGap) {
      ctx.fillRect(0, lineY, shapeWidth, 1);
    }
    ctx.restore();
  }
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  color: Card["color"],
  fill: Card["fill"],
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(shapeWidth / 2, 0);
  ctx.lineTo(shapeWidth, shapeHeight / 2);
  ctx.lineTo(shapeWidth / 2, shapeHeight);
  ctx.lineTo(0, shapeHeight / 2);
  ctx.closePath();
  if (fill === "outline") ctx.stroke();
  if (fill === "solid") {
    ctx.stroke();
    ctx.fill();
  }
  if (fill === "dashed") {
    ctx.save();
    ctx.stroke();
    ctx.clip();

    const dashGap = 3.5;
    for (let lineY = 0; lineY <= shapeHeight; lineY += dashGap) {
      ctx.fillRect(0, lineY, shapeWidth, 1);
    }
    ctx.restore();
  }
}

function drawO(
  ctx: CanvasRenderingContext2D,
  color: Card["color"],
  fill: Card["fill"],
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, 0, shapeWidth, shapeHeight, shapeHeight);
  ctx.closePath();
  if (fill === "outline") ctx.stroke();
  if (fill === "solid") {
    ctx.stroke();
    ctx.fill();
  }
  if (fill === "dashed") {
    ctx.save();
    ctx.stroke();
    ctx.clip();

    const dashGap = 3.5;
    for (let lineY = 0; lineY <= shapeHeight; lineY += dashGap) {
      ctx.fillRect(0, lineY, shapeWidth, 1);
    }
    ctx.restore();
  }
}

function intuitiveModulus(n: number, m: number) {
  // it handles negatives the way you would expect
  return ((n % m) + m) % m;
}
