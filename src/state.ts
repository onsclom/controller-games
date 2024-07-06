const initialGameState = {};

export let gameState = structuredClone(initialGameState);

export function resetGameState() {
  gameState = structuredClone(initialGameState);
}
