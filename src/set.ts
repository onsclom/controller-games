const gameResolution = { width: 400, height: 300 };

// attributes:
// - color: [red, green, blue]
// - fill: [solid, dashed, outline]
// - count: [1, 2, 3]
// - shape: [S, O, diamond]

type Shape = "S" | "O" | "diamond";
type Color = "red" | "green" | "blue";
type Fill = "solid" | "dashed" | "outline";
type Count = 1 | 2 | 3;

type Card = {
  color: Color;
  fill: Fill;
  count: Count;
  shape: Shape;
};

function isSet(cards: [Card, Card, Card]) {
  const allSameColor = new Set(cards.map((card) => card.color)).size === 1;
  const allSameFill = new Set(cards.map((card) => card.fill)).size === 1;
  const allSameCount = new Set(cards.map((card) => card.count)).size === 1;
  const allSameShape = new Set(cards.map((card) => card.shape)).size === 1;

  // a set can also be made of 3 cards with all different values for a particular attribute
  const allDifferentColor = new Set(cards.map((card) => card.color)).size === 3;
  const allDifferentFill = new Set(cards.map((card) => card.fill)).size === 3;
  const allDifferentCount = new Set(cards.map((card) => card.count)).size === 3;
  const allDifferentShape = new Set(cards.map((card) => card.shape)).size === 3;

  return (
    (allSameColor || allDifferentColor) &&
    (allSameFill || allDifferentFill) &&
    (allSameCount || allDifferentCount) &&
    (allSameShape || allDifferentShape)
  );
}

export function updateAndDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dt: number,
) {
  // make letterboxed area
  const gameArea = (() => {
    const drawingRect = canvas.getBoundingClientRect();
    const drawingRectRatio = drawingRect.width / drawingRect.height;
    const targetRatio = gameResolution.width / gameResolution.height;
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
  ctx.scale(
    gameArea.width / gameResolution.width,
    gameArea.height / gameResolution.height,
  );
  ctx.fillRect(0, 0, gameResolution.width, gameResolution.height);

  drawO(ctx, "red", "solid", 3, 50);
  drawO(ctx, "blue", "dashed", 2, 100);
  drawO(ctx, "green", "outline", 1, 150);

  ctx.restore();
}

function drawS(ctx: CanvasRenderingContext2D) {
  const s = {
    curviness: 60,
    width: 300,
    height: 100,
    strokeColor: "blue",
    fillColor: "red",
  };

  ctx.beginPath();
  ctx.moveTo(s.width / 2, 0);

  ctx.bezierCurveTo(
    s.width / 2 + s.curviness,
    s.height / 4,
    s.width / 2 - s.curviness,
    (s.height / 4) * 3,
    s.width / 2,
    s.height,
  );

  ctx.moveTo(s.width / 2, s.height);

  ctx.bezierCurveTo(
    s.width / 2 - s.curviness,
    (s.height / 4) * 3,
    s.width / 2 + s.curviness,
    s.height / 4,
    s.width / 2,
    0,
  );

  ctx.fillStyle = s.fillColor;
  ctx.fill();

  ctx.strokeStyle = s.strokeColor;
  ctx.stroke();
}

// TODO: function to draw a card.
// then pass the card coords to the shape function.

function drawO(
  ctx: CanvasRenderingContext2D,
  color: Color,
  fill: Fill,
  count: Count,
  y: number,
) {
  const shapeWidth = 20;
  const shapeHeight = 32;
  for (let i = 0; i < count; i++) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      20 + (shapeWidth + 10) * i,
      y,
      shapeWidth,
      shapeHeight,
      shapeHeight,
    );
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
      const dashGap = 1.5;
      const startX = 20 + (shapeWidth + 10) * i;
      const endX = startX + shapeWidth;
      const startY = y;
      const endY = y + shapeHeight;

      for (let lineY = startY; lineY <= endY; lineY += 2 + dashGap) {
        ctx.beginPath();
        ctx.moveTo(startX, lineY);
        ctx.lineTo(Math.min(startX + 32, endX), lineY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawDiamond() {}
