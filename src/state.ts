// state is seperated for HMR

import { createState } from "./pong";

export let gameState = createState();

export function resetState() {
  gameState = createState();
}
