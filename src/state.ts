// state is seperated for HMR

const initialGameState = {
  leftScore: 0,
  rightScore: 0,
  leftPaddleY: 150 - 50,
  rightPaddleY: 150 - 50,
  ball: {
    x: 200,
    y: 150,
    dx: 0.1,
    dy: 0.1,
  },
  ballWidth: 10,
};

export let gameState = structuredClone(initialGameState);

export function resetState() {
  gameState = structuredClone(initialGameState);
}
