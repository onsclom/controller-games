// state seperated out for HMR
import { games, colors } from "./constants";

export function createState() {
  return {
    menu: "controller" as "controller" | "game",

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
}

export let state = createState();
