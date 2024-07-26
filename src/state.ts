// mega state struct
import { createState } from "./game-menu/state";

export const state = createState();

export function returnToMenu() {
  state.menu = "game";
}
